const APIURL = 'https://api.github.com/users/'

const loading = document.getElementById("loading")
const mainBody = document.getElementById('main')

const form = document.getElementById('form')
const search = document.getElementById('search')
const main = document.getElementById('cardInfo')
const repoCard = document.getElementById('repoCard')
var datasetLength = 0
var index = 1
var itemsPerPage = 5
var pageUI = document.querySelector('.pagination')
var itemShow  = document.getElementById('itemperpage')

var str = ''

//Function to create a loader
function showLoader() {
    loading.style.display = 'block';
}

//Function to hide the loader
function hideLoader() {
    loading.style.display = 'none';
}

//Making API CALL to get a specific user from username. This endpoint does not require auth bearer token
async function getUser(username) {
    try {
        const { data } = await axios(APIURL + username)

        hideLoader()
        mainBody.style.display = 'flex';

        datasetLength = data.public_repos
        createUserCard(data)
        loadChangeValue()
        //getRepos(str)
        
    } catch (error) {
        if(error.response.status == 404)
        {
            createErrorCard('This username does not exist')
        }
    }
}

//Making API CALL to get the repos. This endpoint does not require auth bearer token
async function getRepos(username) {
    try {
        const { data } = await axios(APIURL + username + '/repos?per_page=' + itemsPerPage + '&page=' + index)

        createRepoCard(data)
    } catch (error) {
        if(error.response.status == 404)
        {
            createErrorCard('Oops!! Something went wrong')
        }
    }
}

//Function to display the user info
function createUserCard(user) {
    const userHTML = `
            <div>
                <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
            </div>
            <div class="user-info">
                <h1><a href="${user.html_url}" target="_blank">${user.name}</a></h1>
                <i>${user.bio}</i> <br>

                <i style="font-size:18px" class="fa">&#xf041; ${user.location}</i>
                <p style="font-size:14px"><a href="${user.html_url}" target="_blank">Visit GitHub Profile</a></p>
                <p style="font-size:14px">Twitter Username : ${user.twitter_username}</p>

                <ul>
                    <li>${user.followers} <strong>Followers</strong></li>
                    <li>${user.following} <strong>Following</strong></li>
                    <li>${user.public_repos} <strong>Repos</strong></li>
                </ul>
            </div>         
    `

    main.innerHTML = userHTML

    const rpoHtml = `
    <div class="repos" id="repos"></div>
    `
    repoCard.innerHTML = rpoHtml

    
}

//Function to display the repo info
function createRepoCard(repos) {
    const reposLocation = document.getElementById('repos')
    const len = repos.length - 1

    repos
        .slice(0, len)
        .forEach(repo => {
            var repoHtml = `
            <div class="repoCard">
                <p class="repoName"><a href="${repo.html_url}" target="_blank">${repo.name}</a></p>
                <p style="font-size:14px; color: #CCCCCC;">${repo.description}</p>
                <p class="repoLang">${repo.language}</p>
            </div>
            `

            reposLocation.innerHTML += repoHtml

        })
    
}

//Function to display the error message
function createErrorCard(msg) {
    const cardHTML = `
        <div class="card">
            <h1>${msg}</h1>
        </div>
    `

    main.innerHTML = cardHTML

    const rpoHtml = `
    <div class="repos" id="repos"></div>
    `
    repoCard.innerHTML = rpoHtml
}

//Function to update the repo info on pagination
function loadChangeValue() {
    itemsPerPage = itemShow.value

    const rpoHtml = `
    <div class="repos" id="repos"></div>
    `
    repoCard.innerHTML = rpoHtml
    
    getRepos(str)

    //First of all clearing all the existing page buttons generated from previous events
    const pageNum = pageUI.querySelectorAll('.list')
    pageNum.forEach(n=>n.remove())

    //Then creating the new page btns for the current event
    pageBtnGenerator(itemsPerPage)

    // Set the first page button as active without triggering a click
    const firstPageButton = pageUI.querySelector('a[data-page="1"]');
    //firstPageButton.click();
    firstPageButton.classList.add('active');
    firstPageButton.style.backgroundColor = 'blue';
    firstPageButton.style.color = 'white';  
    

    // Adding an event listener to the search input for filtering
    const searchInput = document.getElementById('searchrepo');
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.trim();
        filterRepos(searchTerm);
    });
}

//Function to search the repository and filter it out
function filterRepos(searchTerm) {
    // Get all repositories
    const allRepos = document.querySelectorAll('.repoCard');

    // Hide or show repositories based on the search term
    allRepos.forEach(repo => {
        const repoName = repo.querySelector('a').innerText.toLowerCase();
        if (repoName.includes(searchTerm.toLowerCase())) {
            repo.style.display = 'block';
        } else {
            repo.style.display = 'none';
        }
    });

}

//To dynamically create page buttons
function pageBtnGenerator(getitem) {
    console.log("datasetLength = " + datasetLength)
    console.log("getitem = " + getitem)
    if(datasetLength <= getitem) {
        pageUI.style.display = 'none';
    }
    else {
        pageUI.style.display = 'flex';
        const num_of_page = Math.ceil(datasetLength/getitem);
        for(let i=1; i<=num_of_page; i++) {
            const li = document.createElement('li');
            li.className = 'list';
            const a = document.createElement('a');
            a.href = '#';
            a.innerText = i;
            a.setAttribute('data-page', i);
            li.appendChild(a);
            pageUI.insertBefore(li, pageUI.querySelector('.next'));
        }

        // Update pageLink after adding new buttons
        var pageLink = pageUI.querySelectorAll("a");
        console.log("pageLink.length " + pageLink.length)
        // Calling pageRunner to handle click events
        pageRunner(pageLink, getitem, num_of_page);
    }
}

//To mark the page being shown on page button
function pageRunner(page, items, lastPage) {
    for (button of page) {
        button.onclick = e => {
            const page_num = e.target.getAttribute('data-page');
            const page_mover = e.target.getAttribute('id');

            // Removing the 'active' class and reset styling from all buttons
            page.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';  // Reseting background color
                btn.style.color = '';            // Reseting text color
            });

            if (page_num != null) {
                index = page_num;
                // Adding the 'active' class and styling to the clicked button
                e.target.classList.add('active');
                e.target.style.backgroundColor = 'blue';  // Changing the color of btns
                e.target.style.color = 'white';  

            } else {
                if (page_mover === "next") {
                    index++;
                    if (index > lastPage) {
                        index = lastPage;
                    }
                } else {
                    index--;
                    if (index < 1) {
                        index = 1;
                    }
                }

                // Find the button corresponding to the new index and add 'active' class and styling
                const newActiveButton = pageUI.querySelector(`a[data-page="${index}"]`);
                newActiveButton.classList.add('active');
                newActiveButton.style.backgroundColor = 'blue';  // Change the color
                newActiveButton.style.color = 'white';   

            }

            // Calling function to display content for the selected page
            displayPageContent(index, items);
        };
    }
}

//Making api call for server side pagination
async function displayPageContent(pageNumber, itemsPerPage) {
    //To fetch and display content for the selected page
    console.log(`Fetching and displaying content for page ${pageNumber} with ${itemsPerPage} items per page.`);
    // updating the UI to make additional API calls
    
    const rpoHtml = `
    <div class="repos" id="repos"></div>
    `
    repoCard.innerHTML = rpoHtml
    
    try {
        const { data } = await axios(APIURL + str + '/repos?per_page=' + itemsPerPage + '&page=' + pageNumber)

        createRepoCard(data)
    } catch (error) {
        if(error.response.status == 404)
        {
            createErrorCard('Oops!! Something went wrong')
        }
    }
}


form.addEventListener('submit', (e) => {
    e.preventDefault()

    showLoader()
    
    const username = search.value
    str = username
    if(username) {
        getUser(username)

        search.value = ''
    }
})

