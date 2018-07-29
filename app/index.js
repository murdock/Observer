
import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import FolderList from './List';
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
        cursor: "pointer"
     }
});
class App extends Component {
    constructor(props){
        super(props);
        this.state = {
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
        this.getLocation = (lat, lng) => {
            let state = this.state;
            let G_URL = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=true";
            const getData = () => {
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
                            this.setState(state);
                        }

                    })
                    .catch(function(error) {
                        console.log(`Error: ${error.message}`);
                    });
            }

        };
    }
    // shouldComponentUpdate(nextProps){
    //     return this.props != nextProps
    // }
    componentWillMount(){

    }
    componentDidMount(){
        this.init();
        // setInterval(() => {
        //     this.init()
        // }, 10000);
    }
    init(){
        let self = this, state = this.state, counter = 10;
        this.setState({
            isFetching: true
        });
        // let interval = setInterval(() => {
        //     if (counter !== 0) {
        //         this.setState({counter: --counter});
        //     } else {
        //         this.setState({counter: 0});
        //     }
        // }, 1000);

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
                return self.setState({...data, isFetching: false}, ()=>{
                    this.getLocation(data.lat, data.lng);
                }, () => {
                    clearInterval(interval);
                });
            })
            .catch(function(error) {
                console.log(`Error: ${error.message}`);
                setTimeout(() => {
                    self.init();
                });
            });
    }
    render(){
        const {classes} = this.props;
        let data = {...this.state}, counter = this.state.counter || 0;
        if (data) {
            return (
                <div>
                    <div>
                        <i title="Force update" onClick={this.init} className={"material-icons " + classes.refresh}>refresh</i>
                    </div>
                    {this.state.isFetching && <CircularProgress/>}
                    {!this.state.isFetching && <FolderList data={ data || {}}/>}
                </div>
            );
        } else {
            return (<CircularProgress/>)
        }

    }
}
const AppStyled = withStyles(styles)(App);
ReactDOM.render(<AppStyled/>, document.getElementById("root"));

