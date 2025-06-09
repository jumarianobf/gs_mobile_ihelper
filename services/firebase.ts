import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAuth, initializeAuth, type Auth } from 'firebase/auth'

// Workaround para getReactNativePersistence
const getReactNativePersistence = (require('firebase/auth') as any).getReactNativePersistence

const firebaseConfig = {
  apiKey: 'AIzaSyD1DJO5w8__Grn_R3KcrMzf7lXDEDfZV4g',
  authDomain: 'ihelperdrone.firebaseapp.com',
  projectId: 'ihelperdrone',
  storageBucket: 'ihelperdrone.appspot.com',
  messagingSenderId: '312179944143',
  appId: '1:312179944143:web:c3280aa2d8540ca65225ba'
}

let app: FirebaseApp
let auth: Auth

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} else {
  app = getApp()
  auth = getAuth(app)
}

export const db = getFirestore(app)
export { auth }
