import { useEffect, useState } from 'react';
import './App.css';
import LayerSelector from './components/LayerSelector';
import VisualizationGrid from './components/Visualizations';
import { fetchCosineData } from './router/resources/data';
import { ApiResonseDataType } from './types/data';
import ThresholdSlider from './components/ThresholdSlider';
import LoadingIndicator from './components/LoadingIndicator';
import TypeSelector from './components/TypeSelector';
import ResetButton from './components/ResetComponentsButton';
import { active } from 'd3';

function App() {
	const [loading, setLoading] = useState(true);
	const [modelData, setModelData] = useState<ApiResonseDataType>({} as ApiResonseDataType);
	const [threshold, setThreshold] = useState<number>(0.8);
	const [layer, setLayer] = useState<number>(1);
	const [type, setType] = useState<string>('context-0');
	const [activeComponents, setActiveComponents] = useState<Record<string, Set<string> | null>>({});

	useEffect(() => {
		console.log("Fetching data for layer", layer, "type", type, "threshold", threshold);
	
		setLoading(true); // Start loading
	
		fetchCosineData(layer, type, threshold)
		  .then((fetchedData) => {
			if (fetchedData) {
				setModelData(fetchedData);
				console.log(fetchedData);
			} else {
				console.error('Fetched data is undefined');
			}
		  })
		  .catch((err) => {
			console.error('Error fetching data:', err);
		  })
		  .finally(() => {
			setLoading(false); // Stop loading after fetching
		  });
	
	}, [layer, threshold, type]);

	return (
	<div className="App">
		<header className="App-title"> CoBiV: Comparative Bias Visualizer</header>
		<div className="controls-container">
			<LayerSelector layer={layer} setLayer={setLayer} />
			<ThresholdSlider threshold={threshold} setThreshold={setThreshold} />
			<TypeSelector type={type} setType={setType} />
			<ResetButton activeComponents={activeComponents} setActiveComponents={setActiveComponents}/>
		</div>
		<div className='grid'>
			{loading ? <LoadingIndicator /> : <VisualizationGrid modelData={modelData} layer={layer} threshold={threshold} type={type} activeComponents={activeComponents} setActiveComponents={setActiveComponents}/>}
		</div>
	</div>
	)
}

export default App;
