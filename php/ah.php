<?php
$key = 'jCGz64WRumc237fGBClh0Q0x5BlkFqN1';
$ah = new Ahold($key);
print_r($ah->get_winkels(array('winkelformat' => 'AH')));//example call

Class Ahold {

    private $key, $api_url;

    public function __construct($key) {
        $this->key = $key;
        $this->api_url = "https://frahmework.ah.nl/!ahpi";
    }

    public function get_leveringen($params = array()) {
        return $this->_get("leveringen.php", $params);
    }

    public function get_article_info($params = array()) {
        return $this->_get("artikelinfo.php", $params);
    }

    public function get_mutaties($params = array()) {
        return $this->_get("mutaties.php", $params);
    }

    public function get_recepten($params = array()) {
        return $this->_get("recepten.php", $params);
    }

    public function get_transacties($params = array()) {
        return $this->_get("transacties.php", $params);
    }

    public function get_verkoop($params = array()) {
        return $this->_get("verkoop.php", $params);
    }

    public function get_winkels($params = array()) {
        return $this->_get("winkels.php", $params);
    }

 public function get_broodgarantie($params = array()){
        return $this->_get("broodgarantie.php", $params);
    }


    private function _get($path, $params) {
        $params['ahpikey'] = $this->key;
        $query_params = http_build_query($params);
        $url = $this->api_url . '/' . $path . '?' . $query_params;
        //echo $url . "\n";
        $html = file_get_contents($url);
        $json = json_decode($html);
        if ($json == NULL){
             echo $html;
             throw new Exception("Exception on url \t" . $url);                  
        }
        return $json;
    }

}
