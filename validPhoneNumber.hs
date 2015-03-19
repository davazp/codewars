module Codewars.Kata.Phone where
import Data.Char

validPhoneNumber :: String -> Bool
validPhoneNumber str = "(###) ###-####" == map transformDigit str
  where transformDigit ch
          | isDigit ch = '#'
          | ch == '#'  = '!'
          | otherwise  = ch
