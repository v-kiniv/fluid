var Fluid = React.createClass({
  propTypes: {
    size: React.PropTypes.number.isRequired,
    data: React.PropTypes.array,
    score: React.PropTypes.array,
    legend: React.PropTypes.bool,
    linear: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      size: 300,
      score: null,
      legend: false,
      // data: [[0, 100, 100, 100, 0], [0, 100, 100, 0, 100], [100, 20, 0, 100, 0]],
      data: [],
      linear: false,
    };
  },
  getInitialState: function() {
    return {data: this.props.data, score: this.props.score};
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);
    this.d3obj = new Array();

    var parent = this;
    this.state.data.forEach(function(val, index) {
      var active = index == parent.state.data.length - 1;
      parent.d3obj.push(new FluidD3(el, parent.props, {data:val, type: "haze"}));
    });

    var scoreType = this.state.score != null ? "active" : "hidden";
    this.scoreSchart = new FluidD3(el, parent.props, {data:this.state.score, type: scoreType});
  },

  componentDidUpdate: function() {
    var parent = this;
    this.state.data.forEach(function(data, index) {
      parent.d3obj[index].update({data:data, type:"haze"});
    }); 
    if(this.state.score != null) {
      this.scoreSchart.update({data: this.state.score, type:"active"});
    }
  },

  handleClick: function() {
    var el = ReactDOM.findDOMNode(this);
    var newData = new Array();
    
    this.state.data.forEach(function(val, index) {
      var rndData = new Array();
      for (var i = 0; i < 5; i++) {
        rndData.push((Math.random() * 100));
      }
      newData.push(rndData);
    });
    
    var rndData = new Array();
      for (var i = 0; i < 5; i++) {
        rndData.push((Math.random() * 100));
      }
    this.setState({
      data: newData,
      score: rndData,
    });
  },

  handleHover: function() {
    // this.componentDidUpdate();
  },

  render: function() {
    return (
      <svg onMouseEnter={this.handleHover} onClick = {this.handleClick} width={this.props.size} viewBox="0 0 400 400">
        <defs>
          <linearGradient id="fgradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="20%" stopColor="#fb404f" />
            <stop offset="90%" stopColor="#f19d67" />
            <stop offset="100%" stopColor="#f19d67" />
          </linearGradient>
        </defs>
        <g className={this.props.legend ? "legend" : "hidden"} >
        <text x="200" y="30" textAnchor="middle">ADP</text>
        <text x="380" y="150" textAnchor="middle">ARN</text>
        <text x="300" y="350" textAnchor="middle">CMP</text>
        <text x="100" y="350" textAnchor="middle">CNS</text>
        <text x="20" y="150" textAnchor="middle">CNS</text>
        </g>
      </svg>);
  }
});

ReactDOM.render(<Fluid size={400} legend={true}
  score={[100, 50, 80, 0, 100]}
  data={[[0, 100, 100, 100, 0], [0, 100, 100, 0, 100], [100, 20, 0, 100, 0]]}
  />,
  document.getElementById('container')
);