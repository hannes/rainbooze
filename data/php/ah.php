<?php
$ah = new Ahold('f1F2ipoxB0Za1MhjYAhlLx47MBPi80aN');
date_default_timezone_set("UTC");
mb_internal_encoding("ISO-8859-1");

function dateRange( $first, $last, $step = '+1 day', $format = 'Y/m/d' ) {

    $dates = array();
    $current = strtotime( $first );
    $last = strtotime( $last );

    while( $current <= $last ) {

        $dates[] = date( $format, $current );
        $current = strtotime( $step, $current );
    }

    return $dates;
}


// foreach (dateRange('2014-09-15','2014-09-16','+1 day','Y-m-d') as $day) {
//      for ($k=1;$k<15;$k++) {
//         try {
//         foreach ($ah->get_transacties(array('datum' => $day,'kassanr'=>$k)) as $sale) {
//             foreach ($sale as $sf) {
//                 print($sf);
//                 print("\t");
//             }
//             print("\n");
//         }
//         } catch (Exception $e) {
//     }
//      }
// }


for($g=1;$g<1000;$g++) {
    try {

    $a = $ah->get_article_info(array('assgroepnr' => $g))[0];
    if ($a->assgroepomschrijving) {
        print("$g\t".$a->assgroepomschrijving."\n");
    }
} catch (Exception $e) {
     }
}

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
        $html = file_get_contents($url);
        $json = json_decode($html);
        if ($json == NULL){
             //echo $html;
             throw new Exception("Exception on url \t" . $url);                  
        }
        return $json;
    }

}
