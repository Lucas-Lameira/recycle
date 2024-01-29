export function cleanCEPregex(cep = "") {
	return cep.replace("-", "").replace(".", "");
}

export function validateCEP(cep = ""){ 
	const pattern = /^[0-9]{5}-[0-9]{3}$/;
	return pattern.test(cep)
}

export function onlyNumbers(str = "") {
	return /^[0-9]+$/.test(str);
}

export function formatAddress(user) {
	if (!user){
		return ''
	}

	const { cep, city, complement, number, street, uf} = user
	
	return `Rua ${street}, Número:${number} ${complement} | CEP: ${formatCEP(cep)}, ${city} - ${uf}`
}


export function formatCellphone(cellphone = "") {
	if (!cellphone){
		return ""
	}

  cellphone = cellphone.replace(/\D/g, '')

  if (cellphone.length !== 11) {
    throw new Error('Número de telefone inválido. Deve conter 11 dígitos.')
  }

  const formatedCellphone = `(${cellphone.slice(0, 2)}) ${cellphone.slice(2, 7)}-${cellphone.slice(7)}`

  return formatedCellphone
}

export function formatCEP(cep) {
	if (!cep){
		return ""
	}

  cep = cep.replace(/\D/g, '');

  if (cep.length !== 8) {
    return cep
  }

  const formatedCEP = `${cep.slice(0, 5)}-${cep.slice(5)}`;

  return formatedCEP;
}

export function getUserGeolocation () {
  if("geolocation" in navigator){
    const coordinates = navigator.geolocation.getCurrentPosition(position => {
      return [position.coords.latitude, position.coords.longitude]
    });

		return coordinates
  }

	return false 
}



export const DEFAULT_COORDINATES = {
	lat: -1.4630136,
  lng: -48.4887233
}

export  const DEFAULT_MAP_SETTINGS = {
	latitude: -1.4630136,
	longitude: -48.4887233,
	center: [],
	zoom: 15,
	maxZoom: 19
}