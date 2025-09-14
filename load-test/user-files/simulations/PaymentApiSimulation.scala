package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class PaymentApiSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://payment-api:3000")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling Load Test")
    .check(status.in(200, 401, 422))

  // Cenário 1: Health Check - Teste básico de conectividade
  val healthCheckScenario = scenario("Health Check Scenario")
    .exec(
      http("Health Check")
        .get("/health")
        .check(status.is(200))
    )

  // Cenário 2: Root endpoint
  val rootScenario = scenario("Root Scenario")
    .exec(
      http("Root Endpoint")
        .get("/")
        .check(status.is(200))
    )

  // Cenário 3: Auth Me - Endpoint que funciona sem autenticação
  val authMeScenario = scenario("Auth Me Scenario")
    .exec(
      http("Get User Info")
        .get("/api/v1/auth/me")
        .check(status.is(200))
    )

  // Cenário 4: Payments - Teste de endpoint protegido
  val paymentsScenario = scenario("Payments Scenario")
    .exec(
      http("Get Payments")
        .get("/api/v1/payments")
        .check(status.in(200, 401))
    )

  // Cenário 5: Test endpoint
  val testScenario = scenario("Test Scenario")
    .exec(
      http("Test Endpoint")
        .get("/test")
        .check(status.is(200))
    )

  // Cenário 6: Mixed Load - Cenário misto com todos os endpoints
  val mixedLoadScenario = scenario("Mixed Load Scenario")
    .randomSwitch(
      25.0 -> exec(healthCheckScenario),
      25.0 -> exec(rootScenario),
      20.0 -> exec(authMeScenario),
      15.0 -> exec(paymentsScenario),
      15.0 -> exec(testScenario)
    )

  // Configuração dos cenários de teste
  setUp(
    // Teste de aquecimento - 10 usuários por 30 segundos
    healthCheckScenario.inject(
      rampUsers(10).during(30.seconds)
    ).protocols(httpProtocol),

    // Teste de carga normal - 50 usuários por 2 minutos
    mixedLoadScenario.inject(
      rampUsers(50).during(2.minutes)
    ).protocols(httpProtocol)
  )
  .assertions(
    // Assertions para validar performance
    global.responseTime.max.lt(5000), // Tempo máximo de resposta < 5s
    global.responseTime.mean.lt(1000), // Tempo médio de resposta < 1s
    global.successfulRequests.percent.gt(95.0) // Taxa de sucesso > 95%
  )
  .maxDuration(5.minutes) // Duração máxima do teste
}
