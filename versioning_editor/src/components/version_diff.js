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
                <button onClick={() => this.setDiff('A', (() => {
                  if (this.state.compA <= 0) return 0;
                  return --this.state.compA;
                })())}>&lt;</button>
                <button onClick={() => this.setDiff('A', (() => {
                  if (this.state.compA === (this.props.versions.length - 1)) return this.state.compA;
                  return ++this.state.compA;
                })())}>&gt;</button>
              </div>
              <select name="diffA"
                      value={this.state.compA}
                      onChange={e => this.setDiff('A', e.target.value)}>
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
              <button
                className="btn pr-btn"
                onClick={() => this.setState({ showComp: !this.state.showComp })}
              >{this.state.showComp ? 'Hide comparison' : 'Compare across versions' }</button>
            </div>
          </div>
        </div>
        <div className="version-diff-cnt">
          {
            (this.state.compA !== -1 && this.state.compB !== -1) ? <Diff
              inputA={JSON.parse(this.props.versions[this.state.compA].toString()).content}
              inputB={JSON.parse(this.props.versions[this.state.compB].toString()).content}
              type="chars"/> : ''
          }
        </div>
      </div>
    );
  }
}
