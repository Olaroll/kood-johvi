function makeElem(template, ...args) {
	const temp = document.createElement('div')
	temp.innerHTML = template(...args)
	return temp.firstElementChild
}


const suggestionTemplate = (project) => `
<li>${project.clientName} - ${project.name}</li>
`

let token = await fetchToken("user", "user")


let suggestedProjects = await findEmployeeSuggestions(token, 70)

console.log(suggestedProjects)


let suggestionsContainer = document.querySelector("#suggestions")
	.appendChild(document.createElement("ul"))

suggestedProjects.forEach(project => {
	suggestionsContainer.appendChild(makeElem(suggestionTemplate, project))
})


async function findEmployeeSuggestions(token, eid) {
	let pUser = fetchUser(token, eid)
	let pProjects = fetchAllProjects(token)

	let [user, projects] = await Promise.all([pUser, pProjects])

	console.log(user.skills)

	let fittingProjects = []

	projects.forEach(project => {
		let count = 0
		project.technologies.forEach(technology => {
			if (user.skills.map(skill => skill.name).includes(technology)) {
				count++
			}
		})

		if (count === 0) return

		fittingProjects.push([count, project])
	})

	fittingProjects.sort(([countA], [countB]) => {
		return countA-countB
	})

	return fittingProjects.map(([_, project]) => project)
}

async function fetchToken(username, password) {
	let response = await fetch("https://intra.proekspert.ee/pulse-johvi/auth", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({username: username, password: password})
	})

	let json = await response.json()

	return json["token"]
}

async function fetchUser(token, eid) {
	let response = await fetchWithToken(token, `https://intra.proekspert.ee/pulse-johvi/api/employees/${eid}?expand=skills`)

	return response.json()
}

async function fetchAllUsers(token) {
	let response = await fetchWithToken(token, `https://intra.proekspert.ee/pulse-johvi/api/employees?expand=skills`)

	return response.json()
}

async function fetchProject(token, pid) {
	let response = await fetchWithToken(token, `https://intra.proekspert.ee/pulse-johvi/api/projects/${pid}?expand=technologies`)

	return response.json()
}

async function fetchAllProjects(token) {
	let response = await fetchWithToken(token, `https://intra.proekspert.ee/pulse-johvi/api/projects?expand=technologies`)

	return response.json()
}


function fetchWithToken(token, url, opts = {}) {
	let headers = opts?.headers || {}
	Object.assign(headers, {Authorization: "Bearer " + token})
	opts.headers = headers

	return fetch(url, opts)
}


