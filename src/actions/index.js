import firebase from 'firebase';
import { FETCH_HEADER,
         FETCH_HOME_PAGE,
         FETCH_CONTATO,
         FETCH_PAGE, 
         LOADING,
         FETCH_FOTOS,
         FETCH_VIDEOS} from './types';


const dispatchLoading = (dispatch) => {
    dispatch({
        type: LOADING,
        payload: ''
    });
}

export const fetchPageInfo = (page) => {

    const url = `/website/${page}`;   
    
    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .on('value', snapshot => {                    
                    dispatch( { type: FETCH_PAGE, payload: { 'snapshot' : snapshot.val(), 'currentPage': page } });
            });
    };
}

export const fetchHeaderInfo = () => {
    const url = `/website/`;

    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .on('value', snapshot => {
                    dispatch( { type: FETCH_HEADER, payload: snapshot.val() });
            });
    };
}