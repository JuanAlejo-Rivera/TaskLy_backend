import bcrypt from "bcrypt";


export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10) // con 15 sera mas aleatorio, pero entre mas grande mas lento
    return await bcrypt.hash(password, salt)
}
export const checkPassword = async (enterPassword: string, storeHash: string) =>{
    return await bcrypt.compare(enterPassword, storeHash)
}