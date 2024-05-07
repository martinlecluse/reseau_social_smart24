# SMART 2024 Template Repository

![Insalogo](./images/logo-insa_0.png)

Project [SMART(PLD)](riccardotommasini.com/teaching/smart) is provided by [INSA Lyon](https://www.insa-lyon.fr/).

Students: BONDYFALAT Julien, BOYER Thomas, FAYALA Mohamed, LECLUSE Martin, MOUYSSET Tao, ST-CYR Charles-François, VELOSA ROMERO Paula

### Abstract

Soucieux de promouvoir un accès à l'information plus éclairé, nous proposons Husky, une application qui promeut des informations en lesquelles vous avez confiance dans votre fil d'actualité. L'application vous permet également de paramétrer votre fil d'actualité pour que l'algorithme vous propose des contenu vérifiés et/ou diversifiés.

## Description 

Husky implémente des mécanismes de confiance qui impactent l'algorithme de recommandations pour proposer des posts qui correspondent mieux à ce en quoi l'utilisateur à confiance.
Nous proposons des fonctionnalités qui permettent d'indiquer sa confiance (ou au contraire sa méfiance) dans le contenu des posts, mais aussi envers le contenu publié par un autre utilisateur. Husky intègre aussi des fact-checkers, des journalistes accrédités qui peuvent évaluer la justesse des informations publiées. Par la suite, ces vérificatons sont accessibles entièrement par tous les utilisateurs.

Ces mécanismes nous permettent d'intégrer la confiance des utilisateurs envers le contenu dans nos algorithmes de recommandation, tout en évitant l'écueil de consulter nous-mêmes le contenu des posts, ce qui poserait des problèmes éthiques évidents.

## Project Goal

Notre objectif est de développer un prototype de Husky qui implémente les fonctionnalités liées à la confiance, puis de montrer, avec des simulations, l'impact de notre algorithme sur les recommandations des utilisateurs.
Pour cela, nous développerons plusieurs versions de notre algorithme de recommandations, afin de pouvoir comparer leurs effets.

## Requirements

- Using Docker:

    - [Docker](https://www.docker.com/): To run the project in a containerized environment.
    
- Using local environment:

    - [Node.js](https://nodejs.org/): JavaScript runtime built on Chrome's V8 JavaScript engine.
    - [npm](https://www.npmjs.com/): Node package manager.
    - [MongoDB](https://www.mongodb.com/): NoSQL database.

## Installation and execution

- Using Docker:

    1. For each packages in the `packages` directory and each apps in the `apps` directory, follow the instructions in the README file.

    2. Start the project.

        ```bash
        docker-compose up

        # OR

        make # Will only attach to certain services
        ```

## Material

## Note for Students

* Clone the created repository offline;
* Add your name and surname into the Readme file and your teammates as collaborators
* Complete the field above after project is approved
* Make any changes to your repository according to the specific assignment;
* Ensure code reproducibility and instructions on how to replicate the results;
* Add an open-source license, e.g., Apache 2.0;
* README is automatically converted into pdf

