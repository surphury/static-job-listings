/* All HTMLElements have a "$" at the beggining */
let filteredTags = [];
/* HTMLElements */
const $main = document.getElementById('main'),
    $filter = document.getElementById('filter'),
    $filteredTags = document.getElementById('filteredTags'),
    $filterCleaner = document.getElementById('filterCleaner');

/* functions */
/* this functions return a boolean value; if an array includes all elements 
of the second array (parameter) return true, otherwise return false */
Array.prototype.includesAll = function (arr = []) {
    let itIncludes = true;
    for (let i = 0; i < arr.length; i++) {
        itIncludes = this.includes(arr[i]) && itIncludes;
        if (!itIncludes)
            break;
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
        alert('the information could not load, please reload the pages or try later');
    }
}
/* Render the data on the DOM if the information has been obtained */
const renderData = (data) => {
    const fragment = document.createDocumentFragment();
    data.forEach((jobs) => {
        const $card = newNode({ parent: fragment, classes: ['card', 'center'] });

        const $img = newNode({ HTMLTag: 'img', parent: $card, classes: ['card__logo'] });
        $img.setAttribute('src', jobs.logo);
        $img.setAttribute('alt', `Logo de ${jobs.company}`);

        const $container = newNode({ parent: $card, classes: ['container'] });
        const $cardHeader = newNode({ HTMLTag: 'div', parent: $container, classes: ['card__header'] });

        newNode({ HTMLTag: 'strong', parent: $cardHeader, txtContent: jobs.company, classes: ['card__company'] });

        if (jobs.new) /* if jobs.new is true then creates the element */
            newNode({ HTMLTag: 'span', parent: $cardHeader, txtContent: 'NEW!', classes: ['card__tag', 'card__tag--new'] });

        if (jobs.featured) { /* if jobs.featured is true then creates the element */
            newNode({ HTMLTag: 'span', parent: $cardHeader, txtContent: 'FEATURED', classes: ['card__tag', 'card__tag--featured'] });
            $card.classList.add('card--featured');
        }
        newNode({ HTMLTag: 'h2', parent: $container, txtContent: jobs.position, classes: ['card__position'] });

        const $infoList = newNode({ HTMLTag: 'ul', parent: $container, classes: ['card__info-list'] });

        [jobs.postedAt, jobs.contract, jobs.location].forEach((E) => {
            newNode({ HTMLTag: 'li', parent: $infoList, txtContent: E, classes: ['card__info-item'] });
        });

        const $tagsList = newNode({ HTMLTag: 'ul', parent: $card, classes: ['card__tag-list'] });

        const { role, level, languages, tools } = jobs;

        /* create and array with all the tags for the filter */
        const cardTags = [role, level, ...languages, ...tools];

        /* create a "li" for all elements in the array */
        cardTags.forEach((tag) => newNode({ HTMLTag: 'li', parent: $tagsList, txtContent: tag, classes: ['card__tag-item'] }));

        /* set an attribute to cards to make the filter easier */
        $card.tags = cardTags;
    });
    /* append the fragment in the main */
    $main.append(fragment);
}
/* Code for filters */
const filterJobs = (tag) => {
    /* if this tag was filtered, the code is interrupted returning false */
    if ([...document.querySelectorAll('.filter__tag')].some((E) => E.textContent === tag))
        return false;
    /* add to filteredTags the tag to filter */
    filteredTags.push(tag);
    const $filteredTag = newNode({ HTMLTag: 'span', parent: $filteredTags, txtContent: tag, classes: ['filter__tag'] });
    const $tagRemoveBtn = newNode({ HTMLTag: 'button', parent: $filteredTag, classes: ['tag__remove-btn'] });
    $tagRemoveBtn.title = "Remove";
    /* all the card the haven't the property "tags"(array) with the tags in filteredTags (array) will be hidden */
    document.querySelectorAll('.card').forEach((card) => {
        if (!card.tags.includesAll(filteredTags))
            card.classList.add('card--hidden');
    });
    scroll(0,0);
}
const deleteTags = (tag) => {
    filteredTags = filteredTags.filter((E) => E !== tag);
    document.querySelectorAll('.card--hidden').forEach((hiddenCard) => {
        if (hiddenCard.tags.includesAll(filteredTags))
            hiddenCard.classList.remove('card--hidden');
    });
}
const removeFilter = () => {
    /* set the filteredTags to an empty array */
    filteredTags = [];
    /* Remove all the filtered items */
    document.querySelectorAll('.filter__tag').forEach((E) => E.remove());
    /* now all cards will be visible */
    document.querySelectorAll('.card--hidden').forEach((E) => E.classList.remove('card--hidden'));
    $filter.classList.add('filter--hidden');
}
/* end of functions */
/* events */
$main.addEventListener('click', (e) => {
    const $E = e.target;
    if ($E.classList.contains('card__tag-item')) {
        /* get the tag and send it to the function */
        const tag = $E.textContent;
        filterJobs(tag);
        /* $filter (HTMLElement) will be visible */
        $filter.classList.remove('filter--hidden');
    }
});

$filter.addEventListener('click', (e) => {
    const $E = e.target;
    if ($E.classList.contains('tag__remove-btn')) {
        /* send the tag to delete to the function */
        deleteTags($E.parentElement.textContent);
        /* remove the tag from the filter */
        $E.parentElement.remove();
    }
    /* if $filteredTags have not children then hide all the filter */
    if ($filteredTags.childElementCount === 0)
        $filter.classList.add('filter--hidden')
});

$filterCleaner.addEventListener('click', removeFilter);
document.addEventListener('DOMContentLoaded', getData);
/* End of events */