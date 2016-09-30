const ARC_ROUND_FACTOR = 10;
const MAX_R_DIV = 2.7;
const MIN_R_DIV = 4.0;
const LIMB_MIN_R_DIV = 1.8;
const LIMB_ARC_R_DIV = 8;
const START_CIRCLE_R = 40;
const UPD_ANIM_DELAY = 2000;
const FLOAT_ANIM_DELAY = 2000;
const DEF_Z = 0.25;
const DIAMETER = 340;
const MARGIN = 60;
const RND_R = {
	general: 3,
    shapePos: 2,
    limbPos: 2,
    bayRadius: 2,
    arcPos: 2,
    arcRadius: 5,
}

function radialPoints(h, k, radius, z, rndRange) {
	var step = 2 * (Math.PI / radius.length);

	var points = new Array();

	h = randomize(h, rndRange);
	k = randomize(k, rndRange);

	var i = 0;
	for (var j = 0; j < 2 * Math.PI; j += step) {
		var x = h + (radius[i] * Math.cos(z));
		var y = k - (radius[i] * Math.sin(z));
		points.push({
			x: x,
			y: y,
			z: z
		});
		i++;
		z += step;
	}
	return points;
}

function randomize(x, range) {
	var sgn = Math.random() < 0.5 ? -1 : 1;
	return x + (sgn * (Math.random() * range));
}

function pointArc(point, radius, resolution) {
	var arc = new Array();
	var radiusList = Array(resolution).fill(radius);

	var circle = radialPoints(point.x, point.y, radiusList, point.z, 0);

	arc.push(circle[resolution - 1]);
	arc.push(circle[0]);
	arc.push(circle[1]);

	return arc;
}

class FluidD3 {
	constructor(node, props, state, active) {
		this.node = node;
		this.props = props;
		this.state = state;
		this.updating = false;

		var svg = d3.select(node);

		this.lineFunction = d3.svg.line()
			.x(function(d) {
				return randomize(d.x, RND_R.general);
			})
			.y(function(d) {
				return randomize(d.y, RND_R.general);
			})
			.interpolate(props.linear ? "linear-closed" : "basis-closed");

		// Build small circle as start shape for update transition
		var xy = DIAMETER / 2;
		var scales = this.state.data != null ? this.state.data.length * 4 : 20;
		var lineData = radialPoints(xy, xy, Array(scales).fill(START_CIRCLE_R), 0, 0);
		this.path = svg.append("path").attr("d", this.lineFunction(lineData)).attr("class", this.state.type);

		this.update(state);
	}

	draw() {
		var xy = (DIAMETER / 2 ) + MARGIN/2;
		var maxR = DIAMETER / MAX_R_DIV;
		var minR = DIAMETER / MIN_R_DIV;

		// Diminish max radius so shape won't be randomized out of element
		var totalRnd = 0;
		for (var key in RND_R) {
			totalRnd += RND_R[key];
		}
		maxR -= totalRnd / 2;

		var radiusList = new Array();
		// console.log(this.state);
		this.state.data.forEach(function(point, index) {
			var limbMinR = minR / LIMB_MIN_R_DIV;
			var diff = ((maxR - limbMinR) * point) / 100;
			var limbR = randomize(limbMinR + diff, 1);
			radiusList.push(limbR);
			radiusList.push(randomize(minR, RND_R.bayRadius));
		});

		var shape = new Array();
		var roughShape = radialPoints(xy, xy, radiusList, DEF_Z, RND_R.shapePos);

		// round limbs
		var limbIndex = 0;
		for (var i = 0; i < roughShape.length; i += 2) {
			// increase arc radius to round limbs nearby to center
			var arcScaleFactor = (ARC_ROUND_FACTOR * (100 - this.state.data[limbIndex])) / 100;

			var arcRadius = arcScaleFactor + (DIAMETER / LIMB_ARC_R_DIV);
			var arcRadius = randomize(arcRadius, RND_R.arcRadius);
			var limbPoint = {
				x: randomize(roughShape[i].x, RND_R.arcPos),
				y: randomize(roughShape[i].y, RND_R.arcPos),
				z: roughShape[i].z + 0.3,
			}
			shape.push(...pointArc(limbPoint, arcRadius, 12));
			shape.push(roughShape[i + 1]);
			limbIndex++;
		}

		return shape;
	}

	animate() {
		if (this.updating) {
			return;
		}

		var lineData = this.draw(this.node, this.props);
		this.path.transition()
			.duration(FLOAT_ANIM_DELAY)
			.ease("linear")
			.attr("d", this.lineFunction(lineData));

		setTimeout(() => this.animate(this.node, this.props), FLOAT_ANIM_DELAY);
	}

	update(state) {
		this.updating = true;
		this.state = state;
		if(this.state.data == null) {
			return;
		}

		var lineData = this.draw();
		var parent = this;
		this.path.attr("class", this.state.type).transition()
			.duration(UPD_ANIM_DELAY)
			.ease("elastic")
			.attr("d", this.lineFunction(lineData))
			.each("end",function() {
				parent.updating = false;
				parent.animate();
			});
	}

	destroy() {
		this.node.remove();
	}
}