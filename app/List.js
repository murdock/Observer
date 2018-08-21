import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from "@material-ui/core/CircularProgress";
//import LinearBuffer from '../vendors/LinearBuffer';
import Avatar from '@material-ui/core/Avatar';
import {
    AcUnit, Opacity, LocationOn, LocalFlorist, Satellite, Toys, DirectionsCar, MyLocation, GolfCourse
} from '@material-ui/icons';

const toMeters = (str) => {
    return Math.floor(str * 0.3048);
};
const milesToKm = (str) => {
    return Math.round(str * 1.609344);
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
    }
});

class FolderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: location || null
        };
    }

    componentWillMount() {

    };
    componentDidMount() {
        //console.log("componentDidMount", this.state);
    }

    render() {
        let __data = {
            airQuality: "102",
            altitudeFeet: "445.8661",
            humidity: "47",
            lat: "50.39246",
            lng: "30.63237",
            satellites: "12",
            speedMPH: "0.057539",
            temperature: "25"
        };
        let self = this, {
            temperature,
            humidity,
            airQuality,
            altitudeFeet,
            speedMPH,
            lat,
            lng,
            satellites,
            city,
            street,
            index,
            district,
            allocation} = this.props.data || {};

        const {classes, isFetching} = this.props;

        return (
            <Paper className={classes.root}>
                {
                    this.props.data
                    &&
                    <List>
                        <ListItem>
                            <Avatar>
                                <AcUnit />
                            </Avatar>
                            <ListItemText primary={temperature ? <span className={temperature >= 30 ? classes.red : classes.green}>{!isFetching ? temperature : <CircularProgress  size={20}/>}°C {temperature < 0 ? '-' : '+'}</span> : <CircularProgress  size={20}/>}
                                          secondary="Temperature"/>

                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <Opacity />
                            </Avatar>
                            <ListItemText primary={
                                humidity ? <span className={humidity < 40 || humidity > 80 ? classes.red : classes.green}>
                                        {!isFetching ? humidity : <CircularProgress  size={20}/>}%
                                        </span> : <CircularProgress  size={20}/>} secondary="Humidity"/>
                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <LocalFlorist />
                            </Avatar>
                            <ListItemText primary={
                                airQuality ? <span className={airQuality >= 1000 ? classes.red : classes.green}>
                                        {!isFetching ? airQuality : <CircularProgress  size={20}/>}
                                        </span> : <CircularProgress  size={20}/>}
                                        secondary="CO&#x2082; (ppm or mg/l)"/>
                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <MyLocation />
                            </Avatar>
                            <ListItemText
                                primary={ !isFetching ? ( (street || "*Street") +", "+ (allocation || "*Land") ) : <CircularProgress  size={20}/>}
                                secondary={ !isFetching ? ( (district || "*Earth") + ", " + (city || "*Void") + ", " + (index || "*666") ) : <CircularProgress  size={20}/>}
                            />

                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <Satellite />
                            </Avatar>
                            <ListItemText primary={!isFetching ? (satellites || "satellites") : <CircularProgress  size={20}/>}
                                          secondary="Satellites count"/>
                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <GolfCourse />
                            </Avatar>
                            <ListItemText primary={!isFetching ? (altitudeFeet ? toMeters(altitudeFeet) + " m" : 0) : <CircularProgress  size={20}/>}
                                          secondary="Altitude/Meters"/>
                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <DirectionsCar />
                            </Avatar>
                            <ListItemText primary={!isFetching ? (speedMPH ? milesToKm(speedMPH) : 0) : <CircularProgress  size={20}/>}
                                          secondary="Speed / KmH"/>
                        </ListItem>
                    </List>
                }
            </Paper>
        );

    }


}

FolderList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FolderList);