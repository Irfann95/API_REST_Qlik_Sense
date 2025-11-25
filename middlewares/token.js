import bcrypt from "bcrypt";

const hash = await bcrypt.hash(`84KPh4fTGk1darRhpK9mF7s0j96s1s`, 10);
console.log(hash);
