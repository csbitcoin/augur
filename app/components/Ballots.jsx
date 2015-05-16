var _ = require('lodash');
var React = require('react');
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var ProgressBar = ReactBootstrap.ProgressBar;
var utilities = require('../libs/utilities');

var Ballots = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin('asset', 'branch', 'config', 'event')],

  getInitialState: function () {
    return {
      decisions: {}
    };
  },

  getStateFromFlux: function () {
    var flux = this.getFlux();
    var account = flux.store('network').getAccount();

    var state = {
      account: account,
      asset: flux.store('asset').getState(),
      ethereumClient: flux.store('config').getEthereumClient(),
      branchState: flux.store('branch').getState(),
      events: flux.store('branch').getState().ballots
    };

    return state;
  },

  handleSubmitBallot: function() {
    this.getFlux().actions.ballot.hashBallot(
      this.state.branchState.currentBranch.id,
      this.state.branchState.currentBranch.votePeriod,
      this.state.decisions
    );

    // TODO: Make the storing of the decisions make the ballot go away.
  },

  handleChangeDecision: function (eventId, decision) {
    this.setState(function (previousState, currentProps) {
      var decisions = _.clone(previousState.decisions);
      decisions[eventId] = decision;
      return {
        decisions: decisions
      };
    });
  },

  render: function () {

    var currentBranch = this.state.branchState.currentBranch;

    if (!currentBranch) return (<div />);

    var periodStartDate = '';
    var periodEndDate = '';
    var currentPeriod = '-';
    var percentComplete = 0;
    var percentStyle = 'primary';

    if (currentBranch.currentPeriod) {

      var endBlock = currentBranch.currentPeriod * currentBranch.periodLength;
      var periodEndMoment = utilities.blockToDate(endBlock);
      var startBlock = (currentBranch.currentPeriod - 1) * currentBranch.periodLength;
      var periodStartMoment = utilities.blockToDate(startBlock);

      if (periodStartMoment.format('MMM Do') === periodEndMoment.format('MMM Do')) {
        periodStartDate = periodStartMoment.format('MMM Do, HH:MM');
        periodEndDate = periodEndMoment.format('HH:MM');
      } else {
        periodStartDate = periodStartMoment.format('MMM Do, HH:MM');
        periodEndDate = periodEndMoment.format('MMM Do, HH:MM');
      }

      currentPeriod = parseInt(currentBranch.currentPeriod);

      if (currentBranch.votePeriod === (currentPeriod - 1)) {
        percentComplete = parseFloat( ((currentBranch.currentPeriod - currentPeriod) * 100).toFixed(3) );
      } else {
        percentComplete = 100;
        percentStyle = 'warning';
      }
    }

    if (!this.state.events.length) {

      var ballot = (
        <div className='no-decisions'>
          <h4>No decisions require your attention</h4>
        </div>
      );

    } else {

      // build ballot
      var decisionList = _.map(this.state.events, function (event) {
        return (
          <div key={ event.id } className="decision">
            <Decision
              event={ event }
              decision={ this.state.decisions[event.id] }
              onChange={ this.handleChangeDecision }
              {...this.props} />
          </div>
        );
      }, this);

      var allDecisions = _.map(this.state.events, (event) => {
        return this.state.decisions[event.id];
      });
      var isSubmitDisabled = _.any(allDecisions, _.isUndefined);
      var disabledProp = isSubmitDisabled ? {disabled: true} : {};

      var ballot = (
        <div className='ballot shadow clearfix'>
          { decisionList }
          <Button className='pull-right submit-ballot' bsStyle='primary' {...disabledProp} onClick={ this.handleSubmitBallot }>Submit Ballot</Button>
        </div>
      );
    }

    var ballPosition = percentComplete+'%';
    return (
      <div id="ballots">
        <h3>Ballot<span className='subheading pull-right'>Period { currentPeriod }</span></h3>
        <div className='now-ball' style={{marginLeft: ballPosition}}></div>
        <ProgressBar bsStyle={ percentStyle } now={ percentComplete } className='period-progress' />
        <div className='subheading clearfix'>
          { periodStartDate }
          <span className='pull-right'>{ periodEndDate }</span>
        </div>
        { ballot }
      </div>
    );
  }
});

var Decision = React.createClass({
  propTypes: {
    event: React.PropTypes.object.isRequired,
    decision: React.PropTypes.number,
    // onChange takes an event ID and a decision value as a float.
    onChange: React.PropTypes.func.isRequired
  },

  handleChange: function (event) {
    // The change event on radio buttons is fired only on the element that
    // becomes checked, which is what we want.
    this.props.onChange(this.props.event.id, parseFloat(event.target.value));
  },

  render: function() {

    return (
      <div className='row'>
        <div className='col-xs-12'>
          <h4>{ this.props.event.description }</h4>
        </div>
        <div className='col-xs-12'>
          <div className="outcomes row">
            <div className='col-sm-3'>
              <Input
                name={ this.props.event.id }
                type="radio"
                value="0"
                label="No"
                checked={this.props.decision === 0}
                onChange={this.handleChange} />
            </div>
            <div className='col-sm-6'>
              <Input
                name={ this.props.event.id }
                type="radio"
                value="0.5"
                label="Ambiguous / Indeterminate"
                checked={this.props.decision === 0.5}
                onChange={this.handleChange} />
            </div>
            <div className='col-sm-3'>
              <Input
                name={ this.props.event.id }
                type="radio"
                value="1"
                label="Yes"
                checked={this.props.decision === 1}
                onChange={this.handleChange} />
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Ballots;