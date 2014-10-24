/** @jsx React.DOM */
/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

var React = require('react');
var _ = require('lodash');
var cx = require('react/lib/cx');

var personUtils = require('../../core/personutils');
var ModalOverlay = require('../modaloverlay');

var PatientCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    uploadUrl: React.PropTypes.string,
    patient: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      showModalOverlay: false
    };
  },

  render: function() {
    var patient = this.props.patient;
    var self = this;
    var classes = cx({
      'patientcard': true
    });

    var setHighlight = function(highlight) {
      return function() {
        self.setState({
          highlight: highlight
        });
      };
    };

    var stopPropagation = function(event) {
      event.stopPropagation();
    };

    var remove = (function(patient) {
      var classes = cx({
        'patientcard-actions--highlight': self.state.highlight === 'remove'
      });

      if (_.isEmpty(patient.permissions) === false && (!patient.permissions.admin && !patient.permissions.root)) {
        var title = 'Remove yourself from ' + self.getFullName() + "'s care team.";

        return (
          /* jshint ignore:start */
          <a className={classes} href="" onMouseEnter={setHighlight('remove')} onMouseLeave={setHighlight('view')} onClick={self.handleRemove(patient)} title={title}>
            <i className="Navbar-icon icon-remove"></i>
          </a>
          /* jshint ignore:end */
        );
      }
    })(patient);

    var upload = (function(patient) {
      var uploadClasses = cx({
        'patientcard-actions-upload': true,
        'patientcard-actions--highlight': self.state.highlight === 'upload'
      });

      if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
        return (
          /* jshint ignore:start */
          <a className={uploadClasses} onClick={stopPropagation} onMouseEnter={setHighlight('upload')} onMouseLeave={setHighlight('view')} href={self.props.uploadUrl} target='_blank' title="Upload data">Upload</a>
          /* jshint ignore:end */
        );
      }

      return null;
    })(patient);

    var share = (function(patient) {
      var shareUrl = patient.link.slice(0,-5);

      var shareClasses = cx({
        'patientcard-actions-share': true,
        'patientcard-actions--highlight': self.state.highlight === 'share'
      });

      if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
        return (
          /* jshint ignore:start */
          <a className={shareClasses} onClick={stopPropagation} onMouseEnter={setHighlight('share')} onMouseLeave={setHighlight('view')} href={shareUrl} title="Share data">Share</a>
          /* jshint ignore:end */
        );
      }

      return null;
    })(patient);

    var viewClasses = cx({
      'patientcard-actions-view': true,
      'patientcard-actions--highlight': self.state.highlight === 'view'
    });

    var onClick = function() {
      window.location.hash = self.props.href;
      self.props.onClick();
    };

    /* jshint ignore:start */
    return (
      <div>
        <div onMouseEnter={setHighlight('view')} onMouseLeave={setHighlight('')} className={classes}
          onClick={onClick}>
          <i className="Navbar-icon icon-face-standin"></i>
          <div className="patientcard-info">
            <div className="patientcard-fullname">{this.getFullName()}</div>
            <div className="patientcard-actions">
              <a className={viewClasses} href={this.props.href} onClick={this.props.onClick}>View</a>
              {share}
              {upload}
            </div>
          </div>
          <div className="patientcard-leave">
            {remove}
          </div>
          <div className="clear"></div>
        </div>
        {this.renderModalOverlay()}
      </div>
    );
    /* jshint ignore:end */
  },

  renderRemoveDialog: function(patient) {
    return (
      /* jshint ignore:start */
      <div>
        <div className="ModalOverlay-content">{"Are you sure you want to leave this person's Care Team? You will no longer be able to view their data."}</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={this.handleRemovePatient(patient)}>{"I'm sure, remove me."}</button>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  handleRemovePatient: function(patient) {
    var self = this;

    return function() {
      self.props.onRemovePatient(patient.userid, function(err) {
          self.setState({
            showModalOverlay: false,
          });
        }
      );
    };
  },


  handleRemove: function(patient) {
    var self = this;

    return function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveDialog(patient)
      });

      return false;
    };
  },

  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },

  renderModalOverlay: function() {

    return (
      /* jshint ignore:start */
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
      /* jshint ignore:end */
    );

  },

  getFullName: function() {
    return personUtils.patientFullName(this.props.patient);
  }
});

module.exports = PatientCard;
