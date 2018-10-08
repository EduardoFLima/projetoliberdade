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

export const fetchContatoPageInfo = () => {
    const url = `/website/contato`;

    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .on('value', snapshot => {
                    dispatch( { type: FETCH_CONTATO, payload: snapshot.val() });
            });
    };
}

export const fetchFotosPageInfo = () => {
    const url = `/website/fotos`;

    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .once('value', snapshot => {
                    dispatch( { type: FETCH_FOTOS, payload: snapshot.val() });
            });
    };
}

export const fetchVideosPageInfo = () => {
    const url = `/website/videos`;

    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .on('value', snapshot => {
                    dispatch( { type: FETCH_VIDEOS, payload: snapshot.val() });
            })
            ;
    };
}

export const fetchHomePageInfo = () => {
    const url = `/website/home`;

    return (dispatch) => {

        dispatchLoading(dispatch);

        firebase.database().ref(url)
                .on('value', snapshot => {
                    dispatch( { type: FETCH_HOME_PAGE, payload: snapshot.val() });
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