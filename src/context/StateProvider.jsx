import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StateContext = createContext();

const initialState = {
    myList: JSON.parse(localStorage.getItem('netflixMyList')) || [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_LIST':
            const newList = [...state.myList, action.item];
            localStorage.setItem('netflixMyList', JSON.stringify(newList));
            return { ...state, myList: newList };
        case 'REMOVE_FROM_LIST':
            const filteredList = state.myList.filter(item => item.id !== action.id);
            localStorage.setItem('netflixMyList', JSON.stringify(filteredList));
            return { ...state, myList: filteredList };
        default:
            return state;
    }
};

export const StateProvider = ({ children }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
        {children}
    </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);
