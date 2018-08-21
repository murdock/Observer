import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {withStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import CircularProgress from '@material-ui/core/CircularProgress';
import FolderList from './List';
import Moment from 'moment';

// class LineChart extends PureComponent {
//     constructor(props) {
//         super(props);
//     }
//     render(){
//         return (<div>
//
//         </div>)
//     }
//
// }

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
    refresh: {
        cursor: "pointer",
        color: "dodgerblue",
        fontWeight: "bold",
        fontSize: "27px",
        position: "absolute",
        top: "18px",
        '&:hover': {
            color: "green"
        },
    },
    clock: {
        fontSize: "15px",
        fontFamily: "sans-serif",
        fontWeight: "bold",
        color: "gray",
    }
});

class App extends Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.counter = 0;
        this.counterInterval = null;
        this.state = {
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
        this.init = this.init.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
        this.startTimers = this.startTimers.bind(this);
        this.getLocation = (lat, lng) => {
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
                    //console.log(data);
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
                    this.setState({...state});
                })
                .catch(function (error) {
                    console.log(`Error: ${error.message}`);
                });
        };
    }

    shouldComponentUpdate(nextProps, nextState){
        return this.state != nextState || this.props != nextProps
    }
    componentWillMount() {
        this.startTimers();
    }

    componentDidMount() {
        this.init();
    }
    componentWillUnmount(){
        clearInterval(this.timer);
        clearInterval(this.counterInterval);
    }
    init() {
        let self = this, state = this.state, counter = 10;
        this.setState({
            isFetching: true
        }, () => {
            let ws = new WebSocket('ws://localhost:40510');
            // event emmited when connected
            ws.onopen = function () {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                ws.send('connected')
            }
            // event emmited when receiving message
            ws.onmessage = function (ev) {
                console.log(ev);
            }
            //TODO: Get rid of fetch
            fetch('/data')
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
                    return self.setState({...data, isFetching: false}, () => {
                        this.getLocation(data.lat, data.lng);
                    });
                })
                .catch(function (error) {
                    console.log("Fetch error: ", error);
                    setTimeout(() => {
                        self.init();
                    }, 1000);
                });

        });

    }
    startTimers(){
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
        let data = {...this.state};
        if (data) {
            return (
                <div>
                    <div className={classes.clock}>
                        AutoUpdate {this.state.counter > 0 && "in: " + this.state.counter + " sec"} <Switch checked={data.checked}
                                           onChange={this.handleSwitchChange(data.autoUpdate ? 'checkedB' : 'checkedA')}
                                           value={data.checked}
                                    />
                        Force update <i title="Force update" onClick={this.init} className={"material-icons " + classes.refresh}>refresh</i>
                        <p className={classes.clock}>Last update: {this.state.clock}</p>
                    </div>

                    <FolderList isFetching={this.state.isFetching} data={ data || {}}/>
                </div>
            );
        }

    }
}
const AppStyled = withStyles(styles)(App);
ReactDOM.render(<AppStyled/>, document.getElementById("root"));

// {this.state.isFetching && <CircularProgress/>}
// {!this.state.isFetching && <FolderList data={ data || {}}/>}