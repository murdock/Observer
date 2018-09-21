import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import FolderList from '../List';
import Moment from 'moment';
import LinearProgress from "@material-ui/core/LinearProgress";

const env = process.env;
const UPDATE_TIMER = 30000;

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
const
    URL = env.DEVICE_URL,
    GEOLOCATION = env.GEOLOCATION,
    API_KEY = env.API_KEY;

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
                "lat": 0,
                "lng": 0,
                "satellites": 0,
                "speedMPH": 0,
                "altitudeFeet": 0,
                "temperature": 0,
                "humidity": 0,
                "airQuality": 0,
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
    }

    getLocation = (lat, lng) => {

        let state = this.state;

        this.fetchURL(GEOLOCATION + lat + "," + lng + "&key=" + API_KEY)
            .then(response => response.json())
            .then(data => {
                if (data && data.results) {
                    if (data.results[2] && data.results[2].address_components) {
                        state.data.district = data.results[2].address_components[0].long_name;
                    }
                    if (data.results[0]) {
                        data.results[0].geometry && (state.data.allocation = data.results[0].geometry.location_type);

                        if (data.results[0].formatted_address) {
                            let address = data.results[0].formatted_address.split(",");
                            state.data.address = address;
                            state.data.street = address[1] + "," + address[2];
                            state.data.city = address[3] + "," + address[4];
                            state.data.index = address[5];

                        }
                    }
                }

                state.clock = getClock();
                this.setState({data: {...state.data}, isFetching: false});
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
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                self.setState({data: data, isFetching: false});
            })
            .catch(console.log);
    };

    componentDidMount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(() => {

            this.fetchAjaxData();
            this.init();

        }, UPDATE_TIMER);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.counterInterval);
    }

    init() {
        let {data} = this.state;
        if (data && data.lat && data.lng) {
            this.setState({
                isFetching: true
            }, () => this.getLocation(data.lat, data.lng));
        }
    }

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