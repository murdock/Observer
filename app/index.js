import React from 'react';
import ReactDOM from 'react-dom';
const rootElement = document.getElementById('root');
import App from './components/App';
import registerServiceWorker from '../public/registerServiceWorker';
const renderApp = () => ReactDOM.render(
    <App />,
    rootElement
);
renderApp();
registerServiceWorker();