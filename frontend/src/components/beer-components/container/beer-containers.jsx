import BeerContainer from "./beer-container.jsx";
import {beers} from "../../../constants/beers.js";


export default function BeerContainers(){
    return (
        <div className='flex'>
            {beers.map((_, index) => (
                <BeerContainer key={index} />
            ))}
        </div>
    )
}