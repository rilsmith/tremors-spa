import React from "react";
import Plot from 'react-plotly.js';


export default class tremorMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {data: [], layout: {}, frames: [], config: {}};
      }

    

    componentDidMount() {

        const response = require('../static/test.json');
        const features = response['features'];

        var latitudes = []
        var longitudes = []
        var magnitudes = []
        var hovertexts = []
        
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

        /*
        console.log('LON')
        console.log(unpack(features, 'geometry', 'coordinates', 0))

        console.log('LAT')
        console.log(unpack(features, 'geometry', 'coordinates', 1))
        
        console.log(features['geometry']['coordinates'])
        console.log(features['geometry']['coordinates'][0])
        

        console.log('MAG')
        console.log(magnitudes)

        console.log('TEXT')
        console.log(unpack(features, 'properties', 'place'))
        // this.setState({ data: response });

        */

        var data = [{
            type: 'scattergeo',
            locationmode: 'USA-states',
            //lat: unpack(features, 'geometry', 'coordinates', 1),
            //lon: unpack(features, 'geometry', 'coordinates', 0),
            lat: latitudes,
            lon: longitudes,
            hoverinfo: 'text',
            //text: unpack(features, 'properties', 'place'),
            text: hovertexts,
            marker: {
                size: magnitudes.map(function(x) { return x * 2 })
            }
        }]

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

        this.setState({data: data, layout: layout})
        

        /*
        baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson';

        params = { 
            'eventype': 'earthquake',
            'starttime': this.state.start,
            'endtime': this.state.end
        }
        queryString = new URLSearchParams(params).toString();
        url = `${baseUrl}?${queryString}`;

        axios.get(url).then(response => {
            const data = response.data;
            this.setState({ data: data });
        })
        */
       

    }

    render() {
        return (
            <Plot
                data={this.state.data}
                layout={this.state.layout}
                frames={this.state.frames}
                config={this.state.config}
                onInitialized={(figure) => this.setState(figure)}
                onUpdate={(figure) => this.setState(figure)}
            />
        )
    }
}