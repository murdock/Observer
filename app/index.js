import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {withStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FolderList from './List';
import Moment from 'moment';
import setupSocket from "./SetupSocket";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";

const WS_HOST = "ws://localhost:44444";

const getClock = () => {
    return Moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
};

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    paddingLeft: "10px",
    red: {
        color: "red"
    },
    green: {
        color: "green"
    },
    clock: {
        fontSize: "15px",
        fontFamily: "sans-serif",
        color: "gray",
    },
    refresh: {
        cursor: "pointer",
        color: "dodgerblue",
        verticalAlign: "middle",
        '&:hover': {
            color: "green"
        },
        '&:blur': {
            color: "dodgerblue"
        },
    },
    maxWidth: {
        color: "gray",
        width: "100%",
        height: "20px",
        fontSize: "18px",
        fontFamily: "sans-serif",
        fontWeight: "100"
    },
    greenBkg: {
        backgroundColor: "lightgreen"
    },
    grayBkg: {
        backgroundColor: "lightgray"
    }
});


class App extends Component {
    constructor(props) {
        super(props);

        this.timer = null;
        this.connectionTimer = null;
        this.counter = 0;
        this.counterInterval = null;
        this.state = {
            offline: false,
            data: [
                {
                    "temperature": 28,
                    "humidity": 30,
                    "airQuality": 238,
                    "lat": 0,
                    "lng": 0,
                    "satellites": 0,
                    "speedMPH": 0,
                    "altitudeFeet": 0
                }
            ],
            autoUpdate: false,
            clock: getClock(),
            isFetching: false,
            counter: 0,
            address: null,
            street: null,
            city: null,
            index: null,
            district: null,
            allocation: null
        };
        this.socket = setupSocket(this.dispatch, "TEST");
        this.init = this.init.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
        this.startTimers = this.startTimers.bind(this);
    }

    dispatch = (data) => {
        let state = this.state;
        if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
        }
        try {
            let parsed = JSON.parse(data);

            if (parsed && parsed.data && parsed.data.length) {
                let jsonData = parsed.data;

                if (JSON.parse(jsonData)) {

                    jsonData = JSON.parse(jsonData);
                    state.data = jsonData;
                    jsonData.temperature && this.setState({...state, isFetching: false}, () => {
                        this.connectionTimer = setTimeout(() => {
                            this.setState({
                                offline: true
                            });
                        }, 30000);
                    });
                }
            }
        } catch (error) {
            console.log("ERROR: ", error);
        }
    };

    getLocation = (lat, lng) => {
        let state = this.state;
        const G_URL = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=true";
        fetch(G_URL)
            .then(response => {
                if (response.ok) {
                    return Promise.resolve(response);
                }
                else {
                    return Promise.reject(new Error('Failed to load'));
                }
            })
            .then(response => response.json()) // parse response as JSON
            .then(data => {
                if (data && data.results && data.results[2] && data.results[2].address_components) {
                    state.district = data.results[2].address_components[0].long_name;
                }
                if (data && data.results && data.results[0] && data.results[0].geometry) {
                    state.allocation = data.results[0].geometry.location_type;
                }
                if (data && data.results && data.results[0] && data.results[0].formatted_address) {
                    let address = data.results[0].formatted_address.split(",");
                    state.address = address;
                    state.street = address[1] + "," + address[2];
                    state.city = address[3] + "," + address[4];
                    state.index = address[5];

                }
                state.clock = getClock();
                this.setState({...state, isFetching: false});
            })
            .catch(function (error) {
                console.log(`Error: ${error.message}`);
            });

    };

    componentWillReceiveProps(nextProps, nextState) {
       // console.log("nextProps, nextState", nextProps, nextState);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
       // console.log("DID UPDATE", this.state);
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({hasError: true});
        // You can also log the error to an error reporting service
        console.log(error, info);
    }

    componentWillMount() {
        this.startTimers();
    }

    componentDidMount() {
        this.init()
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.counterInterval);
    }

    init() {
        let self = this, state = this.state, counter = 10;
        this.setState({
            isFetching: true
        }, () => this.getLocation(state.data.lat, state.data.lng));
    }

    startTimers() {
        let counter = 20;
        if (this.state.autoUpdate) {
            this.counterInterval = setInterval(() => {
                if (counter > 0) {
                    this.setState({counter: counter--});
                } else {
                    counter = 20;
                    this.setState({counter: counter--});
                }
            }, 1000);

            this.timer = setInterval(() => {
                this.init();
            }, 20000);


        } else {
            this.setState({counter: 0});
            clearInterval(this.timer);
            clearInterval(this.counterInterval);
        }
    }

    handleSwitchChange = name => event => {
        this.setState({autoUpdate: !this.state.autoUpdate, checked: name}, () => {
            this.startTimers()
        });
    };

    render() {
        const {classes} = this.props;
        let state = this.state, offline = this.state.offline;
        //if (data) {
        return (
            <div>
                <h4 className={classes.maxWidth + " " + (offline ? classes.grayBkg : classes.greenBkg)}>
                    {
                        offline ? "OFFLINE" : "ONLINE"
                    }
                </h4>
                <div className={classes.clock}>
                    AutoUpdate {this.state.counter > 0 && "in: " + this.state.counter + " sec"} <Switch
                    checked={state.data.checked}
                    onChange={this.handleSwitchChange(state.data.autoUpdate ? 'checkedB' : 'checkedA')}
                    value={state.data.checked}
                />
                    Force update<p title="Force update" onClick={this.init}
                                    className={"material-icons " + classes.refresh}>refresh</p>
                    <p className={classes.clock}>Last update: {this.state.clock}</p>
                </div>
                {this.state.isFetching && <LinearProgress variant="indeterminate" size={5}/>}
                <FolderList isFetching={this.state.isFetching} data={state.data}/>
            </div>
        );
        //}

    }
}

const AppStyled = withStyles(styles)(App);
ReactDOM.render(<AppStyled/>, document.getElementById("root"));