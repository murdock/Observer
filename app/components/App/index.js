import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {withStyles} from '@material-ui/core/styles';
import FolderList from '../List/List';
import Moment from 'moment';
import LinearProgress from "@material-ui/core/LinearProgress";

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
const URL = "http://multisensor.local/getData";
class App extends Component {
    constructor(props) {
        super(props);

        this.timer = null;
        this.connectionTimer = null;
        this.counter = 0;
        this.counterInterval = null;

        this.state = {
            offline: false,
            data: {
                "lat":0,
                "lng":0,
                "satellites":0,
                "speedMPH":0,
                "altitudeFeet":0,
                "temperature":0,
                "humidity":0,
                "airQuality":0,
                address: null,
                street: null,
                city: null,
                index: null,
                district: null,
                allocation: null
            },
            autoUpdate: false,
            clock: getClock(),
            isFetching: false,
            counter: 0
        };

        this.init = this.init.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
        this.startTimers = this.startTimers.bind(this);
    }

    // dispatch = (data) => {
    //     let state = this.state;
    //     if (this.connectionTimer) {
    //         clearTimeout(this.connectionTimer);
    //     }
    //     try {
    //         let parsed = JSON.parse(data);
    //
    //         if (parsed && parsed.data && parsed.data.length) {
    //             let jsonData = parsed.data;
    //
    //             if (JSON.parse(jsonData)) {
    //
    //                 jsonData = JSON.parse(jsonData);
    //                 state.data = jsonData;
    //                 this.setState({...state, isFetching: false});
    //             }
    //         }
    //     } catch (error) {
    //         console.log("ERROR: ", error);
    //     }
    // };

    getLocation = (lat, lng) => {
        let state = this.state;

        this.fetchURL("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=true")
            .then(response => response.json()) // parse response as JSON
            .then(data => {
                if (data && data.results && data.results[2] && data.results[2].address_components) {
                    state.data.district = data.results[2].address_components[0].long_name;
                }
                if (data && data.results && data.results[0] && data.results[0].geometry) {
                    state.data.allocation = data.results[0].geometry.location_type;
                }
                if (data && data.results && data.results[0] && data.results[0].formatted_address) {
                    let address = data.results[0].formatted_address.split(",");
                    state.data.address = address;
                    state.data.street = address[1] + "," + address[2];
                    state.data.city = address[3] + "," + address[4];
                    state.data.index = address[5];

                }
                state.clock = getClock();
                this.setState({data: {...state.data}, isFetching: false}, () => {
                    //console.log("[APP STATE IS UPDATED]: ", this.state)
                });
            })
            .catch(function (error) {
                console.log(`Error: ${error.message}`);
            });
    };

    fetchURL = url => {
        return fetch(url)
            .then(response => {
                if (response.ok) {
                    return Promise.resolve(response);
                }
                else {
                    return Promise.reject(new Error('Failed to load'));
                }
            });
    };

    fetchAjaxData = () => {
        let self = this;
        this.setState({isFetching: true});
        fetch(URL)
            .then(function(response) {
                console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
                console.log(response.status); // 200

                return response.json();
            })
            .then(function(data) {
                self.setState({data: data, isFetching: false});
            })
            .catch( console.log );
    };

    componentWillMount() {
        this.startTimers();
    }

    componentDidMount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(() => {

            this.fetchAjaxData();
            this.init();

        }, 30000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.counterInterval);
    }

    init() {
        let self = this, state = this.state, counter = 10;
        if (state.data && state.data.lat && state.data.lng) {
            this.setState({
                isFetching: true
            }, () => this.getLocation(state.data.lat, state.data.lng));
        }
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

        return (
            <div>
                <h4 className={classes.maxWidth + " " + (offline ? classes.grayBkg : classes.greenBkg)}>
                    {
                        offline ? "OFFLINE" : "ONLINE"
                    }
                </h4>
                <div className={classes.clock}>
                    <div className={classes.clock}>Last update: {this.state.clock}</div>
                </div>
                {this.state.isFetching && <LinearProgress variant="indeterminate" size={5}/>}
                <FolderList isFetching={this.state.isFetching || false} data={state.data || {}}/>
            </div>
        );

    }
}

export default withStyles(styles)(App);