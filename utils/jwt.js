import jwt from "jsonwebtoken";

export const signJWT = obj => {
    const token =jwt.sign(obj, process.env.JWT_SECRET,{
        expiresIn: "1d",
    });
    /*  store in data base  */

return token;
}

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error.message;
  }
};