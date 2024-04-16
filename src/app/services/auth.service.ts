import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "@angular/fire/auth";


@Injectable()
export class AuthService {
    constructor(private readonly auth: Auth) {}

    signUp(email: string, password: string): void {
        createUserWithEmailAndPassword(this.auth, email, password).then((response) => {
            console.log(response.user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
    }

    signIn(email: string, password: string): void {
        signInWithEmailAndPassword(this.auth, email, password).then((response) => {
            console.log(response.user);  
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
    }

    async loginGoogle(): Promise<void> { 
        return signInWithPopup(this.auth, new GoogleAuthProvider()).then( 
        console.log, 
        console.error 
        ) 
    } 


}