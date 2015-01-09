----- Generate all strings comprised of N properly balanced pair of parenthesis 

depth :: String -> Int
depth path = foldr (+) 0 $ map f path
  where f '(' = 1
        f ')' = (-1)

-- Open a new parenthesis and generate all possible closes.
step :: String -> [String]
step path = map close [0..depth newpath]
  where newpath = path ++ "("
        close n = newpath ++ replicate n ')'

balancedParens :: Int -> [String]
balancedParens n = filter finished $ iterate (>>= step) [""] !! n
  where finished path = depth path == 0
