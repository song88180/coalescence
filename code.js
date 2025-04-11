let rows = [];
let lastSpawnTime = 0;
const margin_upper = 10;
let N_ind = 50;
let running = true;
let mr_log2_scale = -8;
let mutation_rate = 2 ** mr_log2_scale;
let sim_speed = 8;

function setup() {
	// Create and center canvas via CSS
	const canvas = createCanvas(1000, 1100);
	canvas.parent('canvas-wrapper');

	// Add controls to the #controls container
	const controlsDiv = select('#controls');

  // Create a button
	button = createButton('Stop');
	button.size(80, 50);
	button.style('font-size', '18px');
	button.style('font-weight', 'bold');
	button.parent(controlsDiv);
	button.mousePressed(toggleDrawing); 

	controlsDiv.child(createElement('br'));
  controlsDiv.child(createElement('br'));

  // Create a slider controlling N_ind
  sliderLabel = createDiv('Pop_size: 50');
  sliderLabel.style('font-size', '20px');
  sliderLabel.parent(controlsDiv);

  slider = createSlider(5, 100, 50, 1); // min, max, initial, step
  slider.style('width', '150px');
  slider.parent(controlsDiv);
  slider.input(() => {
    N_ind = slider.value();
    sliderLabel.html('Pop_size: ' + N_ind);
  });

  controlsDiv.child(createElement('br'));
  controlsDiv.child(createElement('br'));

  // Create a slider controlling mutation rate
  sliderLabel_mut_rate = createDiv('mut_rate: ' + mutation_rate.toFixed(4));
  sliderLabel_mut_rate.style('font-size', '20px');
  sliderLabel_mut_rate.parent(controlsDiv);

  slider_mut_rate = createSlider(-10, 0, -8, 0.1); // min, max, initial, step
  slider_mut_rate.style('width', '150px');
  slider_mut_rate.parent(controlsDiv);
  slider_mut_rate.input(() => {
    mr_log2_scale = slider_mut_rate.value();
    mutation_rate = 2 ** mr_log2_scale;
    sliderLabel_mut_rate.html('mut_rate: ' + mutation_rate.toFixed(4));
  });

  controlsDiv.child(createElement('br'));
  controlsDiv.child(createElement('br'));

  // Create a slider controlling simulation speed
  sliderLabel_speed = createDiv('sim_speed: ' + sim_speed);
  sliderLabel_speed.style('font-size', '20px');
  sliderLabel_speed.parent(controlsDiv);

  slider_speed = createSlider(1, 10, 8, 0.01); // min, max, initial, step
  slider_speed.style('width', '150px');
  slider_speed.parent(controlsDiv);
  slider_speed.input(() => {
    sim_speed = slider_speed.value();
    sliderLabel_speed.html('sim_speed: ' + sim_speed);
  });

}

// start or stop the draw() loop
function toggleDrawing() {
	if (running) {
		noLoop();
		running = false;
		button.html('Start');
	} else {
		loop();
		running = true;
		button.html('Stop');
	}
}

function draw() {
	background(255);
	translate(1000/2, margin_upper);
	strokeWeight(1);

	if (millis() - lastSpawnTime > 240/sim_speed) {
		add_new_row();
		lastSpawnTime = millis();
	}

	remove_rows(rows);

	draw_all_rows(rows);

}

function mutate_color(color, size=100) {
	const color_new = [];
	for (const x of color) {
		x_new = x + randomGaussian(0, size)
		if (x_new < 0){
			x_new = -x_new
		}
		else if (x_new > 255){
			x_new = 255 * 2 - x_new
		}
		color_new.push(x_new);
	}
	return color_new
}

function add_new_row() {
	let row = [];
	for (let i = 0; i < N_ind; i++) {
		let newIndividual;

		if (rows.length == 0){
			newIndividual = {
				color: [100, 100, 100],
				parent: null
			}
		}

		else{
			N_ind_prev_row = rows[rows.length - 1].length;
			const parent_idx = Math.floor(Math.random() * N_ind_prev_row);
			color_parent = rows[rows.length - 1][parent_idx].color;
			newIndividual = {
				color: Math.random() > mutation_rate ? color_parent : mutate_color(color_parent),
				parent: parent_idx
			}
		}
		row.push(newIndividual);
	}
	row.sort((a, b) => a.parent - b.parent);
	rows.push(row);
}

function draw_all_rows(rows) {
	let if_draw_line = new Set();
	if (rows.length > 1){
		for (let i = 0; i < rows[rows.length - 1].length; i++) {
			if_draw_line.add(i);
		}
	}

	for (let i = rows.length - 1; i >= 0; i--) {
		row = rows[i];
		
		for (const [j, ind] of row.entries()) {
			stroke(...ind.color, 255*0.5);
			strokeWeight(1);
			if (i > 0){
				line((j - row.length/2)*10, i*10, (ind.parent - rows[i-1].length/2)*10, (i-1)*10);
			}

			stroke(color(ind.color));
			strokeWeight(1);
			circle(x=(j - row.length/2)*10, y=i*10, d=5);
		}

		let if_draw_line_next = new Set();

		if (i > 0){
			for (const idx of if_draw_line) {
				ind = row[idx];
				stroke(color(ind.color));
				strokeWeight(4);
				line((idx - row.length/2)*10, i*10, (ind.parent - rows[i-1].length/2)*10, (i-1)*10);
				if_draw_line_next.add(ind.parent);
			}

		}

		if_draw_line = if_draw_line_next;
	}
}

function remove_rows(rows) {
	if (rows.length > 100) {
		rows.splice(0, rows.length - 100);
	}
}

