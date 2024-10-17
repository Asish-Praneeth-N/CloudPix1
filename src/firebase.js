import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {

    apiKey: "AIzaSyD4sVFaqnKUn05y8ZShNLsPaVyoRPqTzjA",
  
    authDomain: "cloudpix-2feea.firebaseapp.com",
  
    projectId: "cloudpix-2feea",
  
    storageBucket: "cloudpix-2feea.appspot.com",
  
    messagingSenderId: "536818210188",
  
    appId: "1:536818210188:web:bfeaa51cc00ce2b9f132a9",
  
    measurementId: "G-D7J8WD3CML"
  
  };
  

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);