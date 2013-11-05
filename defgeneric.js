// defgeneric.js --- CLOS-like Generic functions for Javascript

function callNextMethod(methodInfo) {
  var args = Array.prototype.slice.call(arguments,1);
  return methodInfo.cont.apply(methodInfo.info,args);
};

function defgeneric(name) {
  // Index of methods. A method 't1,t2,t3' is located at
  // methods_index['t1']['t2']['t3'].__combination__[combinations]
  var methods_index = [];

  var generic = function () {
    var method = generic.findMethod.apply(this,arguments);
    return method.apply(generic, arguments);
  };

  function findIndex(discriminator) {
    var discr = discriminator.split(',');
    var index = methods_index;
    for (var i=0; i<discr.length; i++){
      var type = discr[i];
      if (!index[type]) index[type] = {};
      index = index[type];
    }
    return index;
  }

  generic.defmethod = function (discriminator, fn, combination) {
    combination = combination || 'primary';
    var index = findIndex(discriminator);
    index.__combination__ = index.__combination__ || {};
    index.__combination__[combination] = fn;
    // invalidate the cache of effective methods
    cache = {};
    return generic;
  };
  
  generic.removeMethod = function (discriminator, combination) {
    combination = combination || 'primary';
    var index = findIndex(discriminator);
    index.__combination__ = index.__combination__ || {};
    delete index.__combination__[combination];
    // invalidate the cache of effective methods
    cache = {};
    return generic;
  };

  // Return a method combination object, which can be used to create
  // an effective method function as returned by findMethod.
  function computeMethodCombination () {
    var args = Array.prototype.slice.call(arguments);
    var mc = {around: [], before: [], primary: [], after: []};

    function collectMethod(method,combination,reverse){
      if (method && mc[combination].indexOf(method)<0){
        if (!reverse)
          mc[combination].push(method);
        else
          mc[combination].unshift(method);
      }
    }
    
    // Go down into the method indexes and iterate across the methods
    // in most-specific-first order. The applicable methods are
    // collected into the `mc'.
    function findMethods(signature,index){
      if (signature.length == 0 || !index){
        var combination = index && index.__combination__;
        if (signature==0 && combination){
          collectMethod(combination.primary,'primary');
          collectMethod(combination.before, 'before');
          collectMethod(combination.after,  'after', true);
          collectMethod(combination.around, 'around');
        }
      } else {
        var arg = signature[0];
        if (arg instanceof Object){
          while (arg != null){
            findMethods(signature.slice(1), index[arg.constructor.name]);
            arg = arg.__proto__;
          }
          findMethods(signature.slice(1), index['object']);
        } else if (arg === null) {
          findMethods(signature.slice(1), index['null']);
        } else if (typeof arg in index) {
          findMethods(signature.slice(1), index[typeof arg]);
        }
        findMethods(signature.slice(1), index['*']);
      }
    };
    findMethods(args,methods_index);

    return mc;
  }

  // Return the effective method, as return by findMethod for a method
  // combination. It is a callable function.
  function computeEffectiveMethod(mc){
    // A method info is a object with keeps information about the
    // continuation in the composition of methods; we build a chain of
    // this object which will be used by callNextMethod.
    var methodInfo = {
      cont: function () {
        // If there is a primary method in the method
        // combination. This point can only be reached calling
        // callNextMethod from the least specific one one. If there is
        // no, then it will be reached form an around method.
        throw 'No next method found for ' + name + ' in ' + (mc.primary.length? 'primary': 'around');
      },
      info: null
    };
    // Primary method chain
    for (var i=mc.primary.length-1; i>=0; i--)
      methodInfo = {cont: mc.primary[i], info: methodInfo};

    methodInfo = (function(primaryInfo){
      return {cont: function(){
        var result;
        // Before methods
        for (var i=0; i<mc.before.length; i++)
          mc.before[i].apply(mc, arguments);
        // Primary methods
        result = primaryInfo.cont.apply(primaryInfo.info, arguments);
        // After methods
        for (var i=0; i<mc.after.length; i++)
          mc.after[i].apply(mc, arguments);
        return result;
      }};
    })(methodInfo);

    // Around method method chain
    for (var i=mc.around.length-1; i>=0; i--)
      methodInfo = {cont: mc.around[i], info: methodInfo};

    return function () {
      return methodInfo.cont.apply(methodInfo.info, arguments);
    }
  }

  var cache = {};
  generic.findMethod = function () {
    var args = Array.prototype.slice.call(arguments);
    var signature = args.map(function(x){
      if (x instanceof Object){
        return x.constructor.name;
      } else if (x === null) {
        return "null";
      } else
        return typeof x;
    }).join(',');
    // If we have not computed the effective method for a call with
    // this type of arguments, we do it now and cache it the result
    // for later calls.
    if (!cache[signature]){
      var mc = computeMethodCombination.apply(this,args);
      if (!mc.primary.length && !mc.around.length)
        throw 'No method found for ' + name + ' with args: ' +  signature;
      cache[signature] = computeEffectiveMethod (mc);
    }
    return cache[signature];
  }
  return generic;
};
