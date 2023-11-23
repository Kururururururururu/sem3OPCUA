import BeerButton from "./beer-button.jsx";
import {beers} from "../../../constants/beers.js";

export default function BeerButtons() {

    function brewBeer(beer) {
        fetch('/pass-to-queue', {
            method: 'POST',
            body: JSON.stringify({
                type: beer,
                amount: 1
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                // Handle data
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    return (
        <div className={'flex gap-4'}>
            {beers.map((beer, index) => (
                <BeerButton key={index} beer={beer} brewBeer={brewBeer} />
            ))}
        </div>
    )
}