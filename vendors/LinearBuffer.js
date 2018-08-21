import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
});
class ProgressBar extends PureComponent {
    constructor(props){
        super(props);
    }
    render(){
        const {completed, buffer} = this.props;
        return (
            <div>HELLO</div>
        );
    }
}
class LinearBuffer extends Component {

    constructor(props) {
        super(props);

        this.progress = this.progress.bind(this);

        this.timer = null;

        this.state = {
            completed: props.completed || 0,
            buffer: props.buffer || 10,
        };
    }


    componentDidMount() {
        this.timer = setInterval(this.progress, 500);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    progress() {
        const {completed} = this.state;
        if (completed > 100) {
            this.setState({completed: 0, buffer: 10});
        } else {
            const diff = Math.random() * 10;
            const diff2 = Math.random() * 10;
            this.setState({completed: completed + diff, buffer: completed + diff + diff2});
        }
    };

    render() {
        console.log("LINEAR_BUFFER -> PROPS", this.props);
        const { classes } = this.props;
        const {completed, buffer} = this.state;

        return (<ProgressBar completed={completed} buffer={buffer} />);
    }
}

LinearBuffer.propTypes = {
    classes: PropTypes.object.isRequired,
    completed: PropTypes.string.isRequired,
    buffer: PropTypes.string.isRequired,
};

export default withStyles(styles)(LinearBuffer);