import React, { Component } from 'react';
import Diff from 'react-diff';

export default class VersionDiff extends Component {
  constructor(props) {
    super();
    this.state = {
      compA: -1,
      compB: -1,
      showComp: false
    };
    this.setDiff = this.setDiff.bind(this);
    this.setInitialVersionDiff = this.setInitialVersionDiff.bind(this);
  }

  componentDidUpdate() {
    if ((this.props.versions.length > 1)
      && (this.state.compA === -1)
      && (this.state.compB === -1)) {
      this.setInitialVersionDiff(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.versions.length > 0) {
      console.log('versions :: ', this.props.versions.length, nextProps.versions.length);
      if (this.props.versions.length < nextProps.versions.length) {
        this.setInitialVersionDiff(nextProps);
      }
    }
  }

  setInitialVersionDiff(props) {
    this.setState({ compA: props.versions.length - 2 });
    this.setState({ compB: props.versions.length - 1 });
  }

  setDiff(select, version) {
    if (!this.state.showComp) {
      this.setState({ compB: this.props.versions.length - 1 });
    }
    if (select === 'A') {
      return this.setState({ compA: parseInt(version, 10) });
    }
    if (select === 'B') {
      return this.setState({ compB: parseInt(version, 10) });
    }
  }

  render() {
    return (
      <div>
        <div className="version-diff">
          <div className="diff-h">
            <div className="diff-h-sec">
              <div className="dif-nav">
                <button disabled={this.props.versions.length <= 1 ? 'disabled' : '' }
                        onClick={() => this.setDiff('A', (() => {
                          if (this.state.compA <= 0) return 0;
                          return --this.state.compA;
                        })())}>&lt;</button>
                <button disabled={this.props.versions.length <= 1 ? 'disabled' : '' }
                        onClick={() => this.setDiff('A', (() => {
                          if (this.state.compA === (this.props.versions.length - 1)) return this.state.compA;
                          return ++this.state.compA;
                        })())}>&gt;</button>
              </div>
              <select name="diffA"
                      value={this.state.compA}
                      onChange={e => this.setDiff('A', e.target.value)}
                      disabled={this.props.versions.length <= 1 ? 'disabled' : '' }>
                <option value="-1">Version{this.state.showComp ? ' A' : ''}</option>
                {
                  this.props.versions.map((version, i) => {
                    return <option value={i}>Version {i}</option>
                  })
                }
              </select>
            </div>
            {
              this.state.showComp ? (
                <div className="diff-h-sec">
                  <select name="diffB"
                          value={this.state.compB}
                          onChange={e => this.setDiff('B', e.target.value)}>
                    <option value="-1">Version B</option>
                    {
                      this.props.versions.map((version, i) => {
                        return <option value={i}>Version {i}</option>;
                      })
                    }
                  </select>
                  <div className="dif-nav">
                    <button onClick={() => this.setDiff('B', (() => {
                      if (this.state.compB <= 0) return 0;
                      return --this.state.compB;
                    })())}>&lt;</button>
                    <button onClick={() => this.setDiff('B', (() => {
                      if (this.state.compB === (this.props.versions.length - 1)) return this.state.compB;
                      return ++this.state.compB;
                    })())}>&gt;</button>
                  </div>
                </div>
              ) : ''
            }
            <div className="diff-h-sec button-only">
              {
                this.props.versions.length > 1 ? (
                  <button
                    className="btn pr-btn"
                    onClick={() => {
                      this.setInitialVersionDiff(this.props);
                      this.setState({ showComp: !this.state.showComp })
                    }}
                  >{this.state.showComp ? 'Hide comparison' : 'Compare across versions' }</button>
                ) : ''
              }
            </div>
          </div>
        </div>
        <div className="version-diff-cnt">
          {
            (this.state.compA !== -1 && this.state.compB !== -1) ? <Diff
              inputA={this.props.versions[this.state.compA].content}
              inputB={this.props.versions[this.state.compB].content}
              type="chars"/> : ''
          }
        </div>
      </div>
    );
  }
}
