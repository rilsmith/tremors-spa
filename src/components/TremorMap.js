import React from "react";
import Plot from 'react-plotly.js';
import Select from 'react-select';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import "react-datepicker/dist/react-datepicker.css";
import { Col, Container, Row } from "react-bootstrap";
import axios from 'axios';
import { parseISO } from 'date-fns';


export default class tremorMap extends React.Component {
    constructor(props) {
        super(props);
        
        this.coordinates = require('../static/states.json');

        var layout = {
		margin: {l: 0, r: 0, b: 0, t: 0},
            title: 'Earthquakes',
            showlegend: false,
            geo: {
		    projection: {type: 'albers usa' },
		   // {
			
 	           // type: 'miller'
                   // },
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitwidth: 1,
                countrywidth: 1,
                subunitcolor: 'rgb(255,255,255)',
                countrycolor: 'rgb(255,255,255)',
		    resolution: 50
            },
	//	longaxis: { showgrid: false },
	//	lataxis: { showgrid: false },
        }

	var start = parseISO(new Date().toISOString().slice(0,10) + ' 00:00:00')
	var end = parseISO(new Date().toISOString().slice(0,10) + ' 23:59:59')

        this.state = {
            num: 0,
            start: start,
            end: end,
            selectedStates: [],
            //data: data, 
            layout: layout, 
            frames: [], 
            config: {},
	    magLineLayout: {title: 'Magnitude Over Time', xaxis: {showgrid: false, showline: false, zeroline: false, type: 'date', range: [start, end]}, yaxis: {showgrid: false, showline: false, zeroline: false}}
        };
    }

    componentDidMount() {
        this.getEarthquakeData()        
    }

    async getEarthquakeData() {
        const baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson';
        const coords = this.coordinates

        var latitudes = []
        var longitudes = []
        var magnitudes = []
        var hovertexts = []
	var times = []

        var params = { 
            'eventtype': 'earthquake',
            'starttime': this.state.start.toISOString().slice(0,10),
            'endtime': this.state.end.toISOString().slice(0,10)
        }
    
        let selections = this.state.selectedStates
	console.log(coords)
        for (var selection of selections) {
            console.log(selection)
            params['minlatitude'] = coords[selection.value].min_lat
            params['maxlatitude'] = coords[selection.value].max_lat
            params['minlongitude'] = coords[selection.value].min_lng
            params['maxlongitude'] = coords[selection.value].max_lng

            var queryString = new URLSearchParams(params).toString();
            var url = `${baseUrl}?${queryString}`;

            await axios.get(url).then(response => {
                const features = response.data['features'];
                
                for ( var i = 0; i < features.length; i++) {
		    var time = features[i]['properties']['time']
		    times.push(new Date(time))

                    var mag = features[i]['properties']['mag']
                    magnitudes.push(Math.abs(mag))
                    
                    var coordinates = features[i]['geometry']['coordinates']
                    longitudes.push(coordinates[0])
                    latitudes.push(coordinates[1])
                    
                    var text = features[i]['properties']['place']
                    var hovertext = `Location: ${text}<br>Magnitude: ${mag}`
                    hovertexts.push(hovertext)
                    
                }
            })
        }

        var data = [{
            type: 'scattergeo',
            locationmode: 'USA-states',
            lat: latitudes,
            lon: longitudes,
            hoverinfo: 'text',
            text: hovertexts,
            marker: {
                size: magnitudes.map(function(x) { return x * 2 })
            }
        }]
	var magLine = [{
	    type: "scatter",
	    mode: "lines",
            name: "Magnitude",
	    x: times,
	    y: magnitudes
	}]

        this.setState({
            num: this.state.num + 1,
            data: data,
	    magLine: magLine
        })
    }

    dropdownOptions() {
        let arr = []
        for (var key in this.coordinates) {
            const label = this.coordinates[key]['name']
            arr.push({ label: label, value: key })
        }

        return arr
    }

    onDropdownChange = (event, inputValue) => {
        console.log(inputValue)
        
	const arr = this.state.selectedStates
	const index = arr.findIndex(object => object.label === inputValue.label)
	if (index === -1) {
		arr.push(inputValue)
	}

        this.setState({
                selectedStates: inputValue
            },
            this.getEarthquakeData
        )
    }

    handleStartChange = date => {
        if (date) {
            let utc = new Date(date.toUTCString())
            let utcStr = utc.toISOString().slice(0,10) + ' 00:00:00'


            console.log(parseISO(utcStr))
	    this.state.magLineLayout.xaxis.range[0] = parseISO(utcStr)

            this.setState({
                    start: parseISO(utcStr)
                },
                this.getEarthquakeData
            )
        }
    }

    handleEndChange = date => {
        if (date) {
            let utc = new Date(date.toUTCString())
            let utcStr = utc.toISOString().slice(0,10) + ' 23:59:59'

            this.state.magLineLayout.xaxis.range[1] = parseISO(utcStr)
            this.setState(
                {
                    end: parseISO(utcStr)
                },
                this.getEarthquakeData
            )
            }
    }

    render() {
        return (
            <Container fluid>
                <Row className="align-items-center" float="center">
                    <Col lg={3}>
                        <Autocomplete
                            multiple
                            id="states-standard-tags"
                            options={this.dropdownOptions()}
                            onChange={this.onDropdownChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="U.S. States"
                                />
                            )}
                        />
                    </Col>
		    <Col lg={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MobileDatePicker
                                    label="Start Date"
                                    inputFormat="yyyy-MM-dd"
                                    value={this.state.start}
                                    onChange={this.handleStartChange}
                                    renderInput={(params) => <TextField {...params} />}
                                >
                                </MobileDatePicker>
                            </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <MobileDatePicker
                                label="End Date"
                                inputFormat="yyyy-MM-dd"
                                value={this.state.end}
                                onChange={this.handleEndChange}
                                renderInput={(params) => <TextField {...params} />}
                            >
                            </MobileDatePicker>
                        </LocalizationProvider>

                    </Col>
                </Row>
                <Row>
                    <Plot
                        revision={this.state.num}
                        data={this.state.data}
                        layout={this.state.layout}
                        frames={this.state.frames}
                        config={this.state.config}
                        onInitialized={(figure) => this.setState(figure)}
                        onUpdate={(figure) => this.setState(figure)}
                    />
                </Row>
		<Row>
		  <Plot
		    data={this.state.magLine}
		    layout={this.state.magLineLayout}
		  />
		</Row>
            </Container>
        )
    }
}
