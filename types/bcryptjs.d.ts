import bcrypt from "bcryptjs";

const hashed = await bcrypt.hash(password, 10);
const ok = await bcrypt.compare(password, hashed);