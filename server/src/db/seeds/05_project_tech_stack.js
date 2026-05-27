exports.seed = async function (knex) {
  await knex('project_tech_stack').del();

  await knex('project_tech_stack').insert([
    // A금융 (1)
    { project_id: 1, tech: 'Java' },
    { project_id: 1, tech: 'Spring Boot' },
    { project_id: 1, tech: 'MSA' },
    { project_id: 1, tech: 'Kubernetes' },
    { project_id: 1, tech: 'Oracle' },
    // B공공 (2)
    { project_id: 2, tech: 'Java' },
    { project_id: 2, tech: 'Spring Boot' },
    { project_id: 2, tech: 'React' },
    { project_id: 2, tech: 'Oracle' },
    // C제조 (3)
    { project_id: 3, tech: 'Python' },
    { project_id: 3, tech: 'Vue.js' },
    { project_id: 3, tech: 'PostgreSQL' },
    { project_id: 3, tech: 'MQTT' },
    // D보험 (4)
    { project_id: 4, tech: 'Java' },
    { project_id: 4, tech: 'Spring Boot' },
    { project_id: 4, tech: 'MSA' },
    // E통신 (5)
    { project_id: 5, tech: 'Spark' },
    { project_id: 5, tech: 'Kafka' },
    { project_id: 5, tech: 'Hadoop' },
  ]);
};
