const WS_HOST = "ws://localhost:44444";
const types = {
    ADD_USER: "ADD_USER",
    ADD_MESSAGE: "ADD_MESSAGE",
    USERS_LIST: "USERS_LIST",
};
const setupSocket = (dispatch) => {

    const socket = new WebSocket(WS_HOST);

    socket.onopen = () => {
        socket.send(JSON.stringify({macOS: "Client #1 is connected : " + navigator.userAgent}))
    };
    socket.onmessage = (event) => {

        let data = event.data;

        dispatch(data);

    };

    return socket
};

export default setupSocket