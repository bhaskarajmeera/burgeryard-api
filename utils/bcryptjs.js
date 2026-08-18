import bcrypt from "bcryptjs";

// Hash password
export const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 10);
};

// Compare password
export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};