import { AsyncStorage } from 'react-native';
import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import { navigate } from '../navigationRef';

const authReducer = (state, action) => {
    switch (action.type) {
    	case 'clear_error_message':
    		return {...state,errorMessage:''};
        case 'add_error':
            return {...state, errorMessage: action.payload};
        case 'signin' :
            return {errorMessage: '', token: action.payload};
         case 'sign_out' :
            return { token: null, errorMessage: ''};
        default:
            return state;
    }
}

const  clearErrorMessage = dispatch => () => {
	dispatch({type:'clear_error_message'})

};

const tryLocalSignin = dispatch => async ()=>{

    const token = await AsyncStorage.getItem('token');
    // AsyncStorage.setItem('token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZWUyM2U2MzgxOWVmMjMyYThmMTMxMGIiLCJpYXQiOjE1OTE4ODU0MTJ9.NO6BTkrHGzA8H7oCYvWz3G5brFSBWimjtQKhi9zIguE');
    console.log('token',token);
  	if(token){
		dispatch({type:'signin',payload:token})
		navigate('TrackList');
	}else{
		navigate('loginFlow');
	}

};
const signup = (dispatch) => async ({email, password}) => {
        // make api request to sign up with that email and password
        try {
            //if we sign up, modify our state, and make it authenticated
            const response = await trackerApi.post('/signup', {email, password});
            await AsyncStorage.setItem("token", response.data.token);
            dispatch({type: 'signin', payload: response.data.token});

            //navigate to main flow after successful login
            navigate('TrackList');
        } catch (err) {
            console.log(err.response.data)
            dispatch({type: 'add_error', payload: 'Something went wrong with sign up'})
        }


        //if signing up fails, we need to have an error message
    }

const signin = (dispatch) =>  async ({email, password}) => {
        try{
        	const response = await trackerApi.post('/signin',{email,password});
        	await AsyncStorage.setItem("token",response.data.token);
        	dispatch({type:'signin',payload:response.data.token});
        	navigate('TrackList');

        }catch(err){
        	dispatch({type:'add_error',payload:'Something went wrong with Sign in'});
        }


        //Try to signin

        //Handle success - update state

        //Handle failure - error message
    }


const signout = dispatch => async () => {
    console.log('signout')
    	try { 
            await AsyncStorage.removeItem('token');
            dispatch({ type:'sign_out'});
    	    navigate('loginFlow');
        }catch(e){
            console.log(e);
        }
        };

export const { Provider, Context} = createDataContext(
    authReducer,
    {signin, signout, signup, clearErrorMessage ,tryLocalSignin},
    {token: null, errorMessage: ''} //token: null, is basically the same thing as isSignedIn: false. No token, not signed in
)