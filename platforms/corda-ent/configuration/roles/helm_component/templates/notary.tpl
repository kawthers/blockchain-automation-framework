apiVersion: flux.weave.works/v1beta1
kind: HelmRelease
metadata:
  name: {{ component_name }}
  namespace: {{ component_ns }}
  annotations:
    flux.weave.works/automated: "false"
spec:
  releaseName: {{ component_name }}
  chart:
    git: {{ git_url }}
    ref: {{ git_branch }}
    path: {{ charts_dir }}/notary
  values:
    nodeName: {{ component_name }}
    metadata:
      namespace: {{ component_ns }}
    image:
      initContainerName: {{ init_container_name }}
      nodeContainerName: {{ docker_image }}
      imagePullSecret: regcred
      pullPolicy: Always
      privateCertificate: true
    vault:
      address: {{ org.vault.url }}
      certSecretPrefix: secret/{{ org.name | lower }}
      serviceAccountName: vault-auth
      role: vault-role
      authPath: cordaent{{ org.name | lower }}
      retries: 30
      retryInterval: 10
    cenmServices:
      idmanName: {{ org.services.idman.name }}
      networkmapName: {{ org.services.networkmap.name }}
    service:
      p2pPort: {{ notary_service.p2p.port }}
      sshdPort: 2222
      rpc:
        address: "0.0.0.0"
        addressPort: 10003
        admin:
          address: "localhost"
          addressPort: 10770
        standAloneBroker: false
        useSSL: false
        users:
          username: notary
          password: notaryP
    networkServices:
      doormanURL: {{ idman_url }}
      idmanDomain: {{ idman_domain }}
      networkMapURL: {{ networkmap_url }}
      networkMapDomain: {{ networkmap_domain }}
    dataSourceProperties:
      dataSource:
        password: "{{ notary_service.name }}-db-password"
        url: "jdbc:h2:tcp://{{ component_name }}db:{{ notary_service.dbtcp.port }}/persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=100;AUTO_RECONNECT=TRUE;"
        user: "{{ notary_service.name }}-db-user"
      dataSourceClassName: "org.h2.jdbcx.JdbcDataSource"
      dbUrl: "{{ component_name }}db"
      dbPort: {{ notary_service.dbtcp.port }}
    nodeConf:
      legalName: {{ notary_service.subject }}
      emailAddress: {{ notary_service.emailAddress }}
      notaryPublicIP: {{ notary_service.name }}.{{ org.external_url_suffix }}
      devMode: false
      notary:
        validating: {{ notary_service.validating }}
      p2p:
        url: {{ component_name }}.{{ component_ns }}
      ambassador:
        p2pPort: {{ notary_service.p2p.ambassador | default('10002') }}
        external_url_suffix: {{ org.external_url_suffix }}
        p2pAddress: {{ component_name }}.{{ org.external_url_suffix }}:{{ notary_service.p2p.ambassador | default('10002') }}
      jarPath: bin
      configPath: etc
      cordaJar:
        memorySize: 1524
        unit: M
      volume:
        baseDir: /opt/corda/base
      pod:
        resources:
          limits: 2056M
          requests: 2056M
      storage:
        name: cordaentsc
        memory: 512Mi
      replicas: 1
    healthCheckNodePort: 0
    sleepTimeAfterError: 60
    sleepTime: 10
    healthcheck:
      readinesscheckinterval: 10
      readinessthreshold: 15