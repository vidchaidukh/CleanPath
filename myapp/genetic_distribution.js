function generateInitialPopulation(trucks, buckets) {
    let population = [];
    for (let i = 0; i < 100; i++) {
        let chromosome = [];
        for (let j = 0; j < buckets.length; j++) {
            chromosome.push(Math.floor(Math.random() * trucks.length));
        }
        population.push(chromosome);
    }
    return population;
}

function calculateFitness(chromosome, trucks, buckets) {
    // Розраховуємо "фітнес" кожного хромосоми - суму відстаней між смітниками та їхніми призначеними вантажівками
    let fitness = 0;
    for (let i = 0; i < chromosome.length; i++) {
        let truck = trucks[chromosome[i]];
        let bucket = buckets[i];
        let distance = calculateDistance(truck, bucket);
        fitness += distance;
    }
    return fitness;
}

function calculateDistance(point1, point2) {
    // Розрахунок відстані між двома точками (може бути власна логіка для вашого випадку)
    let deltaX = point1.lon - point2.lon;
    let deltaY = point1.lat - point2.lat;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function crossover(parent1, parent2) {
    // Одноточковий кросовер для генерації нащадка
    let crossoverPoint = Math.floor(Math.random() * parent1.length);
    let child = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
    return child;
}

function mutate(chromosome, mutationRate, trucks) {
    // Випадкова мутація з заданою ймовірністю для кожного елемента хромосоми
    for (let i = 0; i < chromosome.length; i++) {
        if (Math.random() < mutationRate) {
            chromosome[i] = Math.floor(Math.random() * trucks.length);
        }
    }
}

function geneticAlgorithm(trucks, buckets, generations, mutationRate) {
    let population = generateInitialPopulation(trucks, buckets);
    let minFitnessIndex = null
    for (let generation = 0; generation < generations; generation++) {
        let fitnessScores = population.map(chromosome => calculateFitness(chromosome, trucks, buckets));
        minFitnessIndex = fitnessScores.indexOf(Math.min(...fitnessScores));
        let bestChromosome = population[minFitnessIndex];

        let newPopulation = [bestChromosome];

        while (newPopulation.length < population.length) {
            let parent1 = population[Math.floor(Math.random() * population.length)];
            let parent2 = population[Math.floor(Math.random() * population.length)];
            let child = crossover(parent1, parent2);
            mutate(child, mutationRate, trucks);
            newPopulation.push(child);
        }

        population = newPopulation;
    }

    let bestChromosome = population[minFitnessIndex];
    return bestChromosome;
}

