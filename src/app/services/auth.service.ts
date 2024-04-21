import { Injectable } from "@angular/core";
import { Auth, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, UserCredential } from "@angular/fire/auth";


@Injectable()
export class AuthService {
    constructor(private readonly auth: Auth) {}

    async signIn(email: string, password: string): Promise<string> {
        let accessToken = "";
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        accessToken = await userCredential.user.getIdToken();

        return accessToken;
    }

    // signUp(email: string, password: string): void {
    //     createUserWithEmailAndPassword(this.auth, email, password).then((response) => {
    //         console.log(response.user);
    //     })
    //     .catch((error) => {
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //         console.log(errorCode, errorMessage);
    //     });
    // }
    

    // async loginGoogle(): Promise<void> { 
    //     return signInWithPopup(this.auth, new GoogleAuthProvider()).then( 
    //     console.log, 
    //     console.error 
    //     ) 
    // } 


}