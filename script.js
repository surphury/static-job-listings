/* All HTMLElements have a "$" at the beggining */
let filteredTags = [];
/* HTMLElements */
const $main = document.getElementById('main'),
    $filter = document.getElementById('filter'),
    $filteredTags = document.getElementById('filteredTags'),
    $clear = document.getElementById('clear');

/* functions */
/* this functions return a boolean value; if an array includes all elements 
of the second array (parameter) return true, otherwise return false */
Array.prototype.includesAll = function (arr = []) {
    let itIncludes = true;
    for (let i = 0; i < arr.length; i++) {
        itIncludes = this.includes(arr[i]) && itIncludes;
        if (!itIncludes)
            return false;
    }
    return itIncludes;
}
/*create new Element, append them and return them*/
const newNode = ({ HTMLTag = 'div', parent, txtContent = '', classes = [] }) => {
    const $node = document.createElement(HTMLTag);
    /* add textContent if it is defined */
    if (txtContent !== undefined)
        $node.textContent = txtContent;
    /* ADD CLASS IF IT IS DEFINED */
    if (classes.length > 0)
        classes.forEach((E) => $node.classList.add(E));
    /* APPEND THE NODE IN THE PARENT NODE (PARAMETER)*/
    parent.append($node)
    return $node;
}
/* Wait to get the information and if it could not loaded print it in console and alert to the user */
const getData = async () => {
    try {
        renderData(await (await fetch('data.json')).json());
    } catch (error) {
        console.error(error);
        alert('the information could not load, please Reload the pages or try later');
    }
}
/* Render the data on the DOM if the information has been obtained */
const renderData = (data) => {
    const fragment = document.createDocumentFragment();
    data.forEach((jobs) => {
        const $card = newNode({ parent: fragment, classes: ['card', 'center'] });

        const $img = newNode({ HTMLTag: 'img', parent: $card, classes: ['logo'] });
        $img.setAttribute('src', jobs.logo);
        $img.setAttribute('alt', `Logo de ${jobs.company}`);

        const $container = newNode({ parent: $card, classes: ['container'] });
        const $cardHeader = newNode({ HTMLTag: 'div', parent: $container, classes: ['card__header'] });

        newNode({ HTMLTag: 'strong', parent: $cardHeader, txtContent: jobs.company, classes: ['company'] });

        if (jobs.new) /* if jobs.new is true then creates the element */
            newNode({ HTMLTag: 'span', parent: $cardHeader, txtContent: 'NEW!', classes: ['tag', 'new-tag'] });
        if (jobs.featured) { /* if jobs.featured is true then creates the element */
            newNode({ HTMLTag: 'span', parent: $cardHeader, txtContent: 'FEATURED', classes: ['tag', 'featured-tag'] });
            $card.classList.add('featured');
        }
        newNode({ HTMLTag: 'h2', parent: $container, txtContent: jobs.position, classes: ['position'] });

        const $infoList = newNode({ HTMLTag: 'ul', parent: $container, classes: ['info-list'] });

        [jobs.postedAt, jobs.contract, jobs.location].forEach((E) => {
            newNode({ HTMLTag: 'li', parent: $infoList, txtContent: E, classes: ['info-item'] });
        });

        const $requirementsList = newNode({ HTMLTag: 'ul', parent: $card, classes: ['requirements-list'] });

        const { role, level, languages, tools } = jobs;
        
        /* create and array with all the tags for the filter */
        const requirements = [role, level, ...languages, ...tools];

        /* create a "li" for all elements in the array */
        requirements.forEach((E) => newNode({ HTMLTag: 'li', parent: $requirementsList, txtContent: E, classes: ['req-item'] }));

        /* set an attribute to cards to make the filter easier */
        $card.requirements = requirements;
    });
    /* append the fragment in the main */
    $main.append(fragment);
}
/* Code for filters */
const filterJobs = (tag) => {
    /* if this tag was filtered, the code is interrupted returning false */
    if ([...document.querySelectorAll('.filtered-item')].some((E) => E.textContent === tag))
        return false;
    /* add to filteredTags the tag to filter */
    filteredTags.push(tag);
    const $filterItem = newNode({ HTMLTag: 'span', parent: $filteredTags, txtContent: tag, classes: ['filtered-item'] });
    const $removeTag = newNode({ HTMLTag: 'button', parent: $filterItem, classes: ['remove-tag'] });
    $removeTag.title = "Remove";
    /* all the card the haven't the array "requirements" with the tags in filteredTags (array) will be hidden */
    document.querySelectorAll('.card').forEach((card) => {
        if (!card.requirements.includesAll(filteredTags))
            card.classList.add('hidden');
    });
}
const deleteTags = (tag) => {
    filteredTags = filteredTags.filter((E) => E !== tag);
    document.querySelectorAll('.card.hidden').forEach((hiddenCard) => {
        if (hiddenCard.requirements.includesAll(filteredTags))
            hiddenCard.classList.remove('hidden');
    });
}
const removeFilter = () => {
    /* set the filteredTags to an empty array */
    filteredTags = [];
    /* Remove all the filtered items */
    document.querySelectorAll('.filtered-item').forEach((E) => E.remove());
    /* now all cards will be visible */
    document.querySelectorAll('.card.hidden').forEach((E) => E.classList.remove('hidden'));
    $filter.classList.add('hidden');
}
/* end of functions */
/* events */
$main.addEventListener('click', (e) => {
    const $E = e.target;
    if ($E.classList.contains('req-item')) {
        /* get the tag and send it to the function */
        const tag = $E.textContent;
        filterJobs(tag);
        /* $filter (HTMLElement) will be visible */
        $filter.classList.remove('hidden');
    }
});

$filter.addEventListener('click', (e) => {
    const $E = e.target;
    if ($E.classList.contains('remove-tag')) {
        /* send the tag to delete to the function */
        deleteTags($E.parentElement.textContent);
        /* remove the tag from the filter */
        $E.parentElement.remove();
    }
    /* if $filteredTags have not children then hide all the filter */
    if($filteredTags.childElementCount === 0)
    $filter.classList.add('hidden')
});

$clear.addEventListener('click', removeFilter);
document.addEventListener('DOMContentLoaded', getData);
/* End of events */