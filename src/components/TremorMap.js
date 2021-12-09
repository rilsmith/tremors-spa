import React from "react";
import Plot from 'react-plotly.js';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Col, Container, Row } from "react-bootstrap";
import axios from 'axios';
import { parseISO } from 'date-fns';


export default class tremorMap extends React.Component {
    constructor(props) {
        super(props);
        
        this.coordinates = require('../static/states.json');


        /*
        var latitudes = []
        var longitudes = []
        var magnitudes = []
        var hovertexts = []

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
        */
        var layout = {
            title: 'Earthquakes',
            showlegend: false,
            geo: {
                scope: 'usa',
                projection: {
                    type: 'albers usa'
                },
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitwidth: 1,
                countrywidth: 1,
                subunitcolor: 'rgb(255,255,255)',
                countrycolor: 'rgb(255,255,255)'
            }
        }

        this.state = {
            num: 0,
            start: parseISO(new Date().toISOString().slice(0,10) + ' 00:00:00'),
            end: parseISO(new Date().toISOString().slice(0,10) + ' 23:59:59'),
            selectedStates: [],
            //data: data, 
            layout: layout, 
            frames: [], 
            config: {}
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
        var params = { 
            'eventtype': 'earthquake',
            'starttime': this.state.start.toISOString().slice(0,10),
            'endtime': this.state.end.toISOString().slice(0,10)
        }
    
        let selections = this.state.selectedStates
        for (var selection of selections) {
            params['minlatitude'] = coords[selection.value].min_lat
            params['maxlatitude'] = coords[selection.value].max_lat
            params['minlongitude'] = coords[selection.value].min_lng
            params['maxlongitude'] = coords[selection.value].max_lng

            var queryString = new URLSearchParams(params).toString();
            var url = `${baseUrl}?${queryString}`;

            await axios.get(url).then(response => {
                //const response = require('../static/test.json');
                const features = response.data['features'];
                
                for ( var i = 0; i < features.length; i++) {
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

        this.setState({
            num: this.state.num + 1,
            data: data
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

    onDropdownChange = inputValue => {
        //console.log(inputValue)

        this.setState({
                selectedStates: inputValue
            },
            this.getEarthquakeData
        )
    }

    handleStartChange = date => {
        let utc = new Date(date.toUTCString())
        let utcStr = utc.toISOString().slice(0,10) + ' 00:00:00'

        this.setState({
                start: parseISO(utcStr)
            },
            this.getEarthquakeData
        )
    }

    handleEndChange = date => {
        let utc = new Date(date.toUTCString())
        let utcStr = utc.toISOString().slice(0,10) + ' 23:59:59'

        this.setState(
            {
                end: parseISO(utcStr)
            },
            this.getEarthquakeData
        )
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <Select
                            isMulti
                            options={this.dropdownOptions()}
                            onChange={this.onDropdownChange}
                        ></Select>
                    </Col>
                    <Col>
                        <Select>

                        </Select>
                    </Col>
                    <Col>
                        <DatePicker selected={this.state.start} onChange={this.handleStartChange} />
                    </Col>
                    <Col>
                        <DatePicker selected={this.state.end} onChange={this.handleEndChange} />
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
            </Container>
        )
    }
}