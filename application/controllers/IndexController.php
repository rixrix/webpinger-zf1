<?php

class IndexController extends Zend_Controller_Action
{

	/**
	 * Default action
	 */
	public function indexAction() {}

	/**
	 * Ping action handler
	 *
	 * @param 	$mixed	Host or IP address via $_GET
	 * @returns $mixed	latency result in JSON format; otherwise return a 400 HTTP error code.
	 */
	public function pingAction() {
		$result = array();
		$hosts = $this->getRequest()->getParam('hosts', null);
		if ($hosts) {
			$hosts = explode(',', $hosts);
			$result = $this->pingHosts($hosts);
		}

		if ($result) {
			echo $this->_helper->json($result);
		} else {
			$this->getResponse()->setHttpResponseCode(400);
		}

		$this->_helper->layout->disableLayout();
	}

	/**
	 * Ping a set of hostnames or IP Addresses and returns its network latency in milliseconds.
	 *
	 * @param 	array of hostnames or IP addresses
	 * @return 	array of ping results with its hostname
	 */
	private function pingHosts($hosts) {
		$result = array();
		foreach($hosts as $host) {
			$result[$host] = $this->pingHostCmd($host);
		}
		return $result;
	}

	/**
	 * Does the actual ping to a host|ip. It does some basic sanitation of the hostname|ip to prevent
	 * on tricking the shell command into executing arbitrary commands.
	 *
	 * @param	string	$host
	 * @return	mixed	host latency (in milliseconds). Default null
	 */
	private function pingHostCmd($host) {
		$data_idx = 1;
		$latency_idx = 6;
		$host = escapeshellcmd($host);
		$cmd = "ping -n -c 1 {$host}";

		$raw_output = exec($cmd, $output);
		if (!empty($output[$data_idx])) {
			$array = explode(' ', $output[$data_idx]);
			$latency = str_replace('time=', '', $array[$latency_idx]);
			$latency = str_replace('ms', '', $latency);

			return ($latency < 1) ? 0 : $latency;
		}

		return null;
	}
}

