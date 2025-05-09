import React from 'react'
import ResultsChart from './ResultsChart'

function Results(props) {
  return (
    <div className='table-container'>
        <h1>{props.data[0]?.location}</h1>
        <div className='chart-container mb-4'>
            <ResultsChart data={props.data} />
        </div>
        <div className='table-responsive'>
            <table class="table table-striped table-color">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sunrise</th>
                        <th>Sunset</th>
                        <th>Golden Hour</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.map((data, index) => (
                        <tr key={index}>
                            <td>{data.start_date}</td>
                            <td>{data.sunrise}</td>
                            <td>{data.sunset}</td>
                            <td>{data.golden_hour}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Results
