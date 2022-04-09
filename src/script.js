const w = 970;
const h = 640;
const squareSize = 30;
const percentage = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
const p = {left: squareSize * 12.05, top: squareSize, right: squareSize * 5};

const svg = d3.select('#container')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .attr("viewBox", [0, 0, w, h])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
  .then(obj => {
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
    .then(obj2 => {
    const countyData = obj;
    const geometry = obj2;
    const counties = topojson.feature(geometry, geometry.objects.counties);
    const states = topojson.mesh(geometry, geometry.objects.states, (a, b) => a !== b);
    const path = d3.geoPath();
    const colorScale = d3.scaleSequential(d3.interpolatePurples);
    const dataMap = new Map();
    
    countyData.map(c => dataMap.set(c.fips, [c.bachelorsOrHigher, c.area_name, c.state]));
    
    const tooltip = d3.select('body')
      .append("div")
      .attr('id', 'tooltip');
    
    svg.append('g')
      .selectAll('path')
      .data(counties.features)
      .join('path')
        .attr('class', 'county')
        .attr('fill', c => colorScale((dataMap.get(c.id)[0] / 100) + 0.3))
        .attr('data-education', c => dataMap.get(c.id)[0])
        .attr('data-fips', c => c.id)
        .on('mouseover', (event, c) => {
          const x = event.pageX + 30;
          const y = event.pageY + 15;
          
          tooltip.style('opacity', 0.8)
            .attr('data-education', dataMap.get(c.id)[0])
            .attr('data-fips', c.id)
            .style('top', y + 'px')
            .style('left', x + 'px');
      
          tooltip.html(dataMap.get(c.id)[0] + '%' + '<br/>' +
                  'County: ' + dataMap.get(c.id)[1] + '<br/>' +
                  'State: ' + dataMap.get(c.id)[2]);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0)
        })
        .attr('d', path);
    
    svg.append('path')
      .datum(states)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);
    
    const legend = svg.append('g')
    .attr('id', 'legend');
  
    const colorAxisScale = d3.scaleLinear()
      .domain([0, 0.7])
      .range([w - p.left, w - p.right]);
    
    const format = d3.format('.0%');
    
    const colorAxis = d3.axisBottom(colorAxisScale)
      .tickValues(percentage)
      .tickFormat(format);
    
    legend.append('g')
      .attr('transform', 'translate(0,' + p.top + ')')
      .call(colorAxis);
    
    legend.selectAll('rect')
      .data(percentage.slice(0, 7))
      .enter()
      .append('rect')
      .attr('x', c => colorAxisScale(c))
      .attr('y', '0px')
      .attr('fill', c => colorScale(c + 0.3))
      .attr('height', squareSize)
      .attr('width', squareSize);
  });
});