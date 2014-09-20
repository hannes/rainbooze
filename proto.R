library(dplyr)
setwd("~/source/rainbooze/data/")
txns <- read.csv("transactions.tsv",sep="\t",stringsAsFactors=F,header=F)
names(txns) <- c("datum","transactiestart","kassanr","cassierenr","transactienr","nasanr","imageid",
                 "omschrijving","kassabonomschrijving","inhoud","aantal","gewicht","prijs","aktieindicatie",
                 "pakketnr","pakketomschrijving","artikelkorting","bonusvoordeel","wagnr","assgroepnr",
                 "eancode","zegels","notimportant")
grps <- read.csv("groups.tsv",sep="\t",stringsAsFactors=F,header=F)
names(grps) <- c("assgroepnr","assgroepname","assgroeprank")

res <- mutate(txns,transactienr,transactiestart,hod=as.integer(substring(transactiestart,1,2))) %>% left_join(grps,by="assgroepnr") %>% 
  group_by(transactienr) %>% summarize(n=n(),rank=round(mean(assgroeprank),2)) %>% arrange(rank)

res

# 
# library(ggplot2)
# library(ggthemes)
# thm <- theme_few(base_size = 14)
# ddd <- res %>% group_by(hod) %>% summarize(n=n(),ar=mean(rank))
# ggplot(ddd, aes(x=hod,y=ar,group=1)) + 
#   geom_line() + geom_point() +
# #  theme + xlab("Hour of day") + ylab("Delay (min/km)") + ggtitle("New York Taxi Delays by Hour")
#   

prodnames <- txns %>% group_by(eancode,omschrijving) %>% summarise() %>% mutate(omclean=gsub("(^ah )|([^a-z ]+)","",omschrijving,perl=T)) %>% arrange(omclean)

#prodnames <- head(prodnames,1000)
nuts <-do.call("rbind",lapply(prodnames$omclean,function(name){
  print(name)
  
  dd <- fromJSON(file=paste0("http://localhost:8888/prodinfo?q=",URLencode(name)), method='C')
  if (length(dd) < 1) {
    return(NA)
  }
  #print(dd)
  dd
  }))
nut <- as.data.frame(nuts)

nut$ean <- prodnames$eancode
nut$oname <- prodnames$omschrijving
head(nut)

nut$name <- as.character(nut$name)
nut$calories <- as.numeric(nut$calories)
nut$sugars <- as.numeric(as.character(nut$sugars))
nut$sat_fat <- as.numeric(as.character(nut$sat_fat))
nut$unsat_fat <- as.numeric(as.character(nut$unsat_fat))
nut$fibers <- as.numeric(as.character(nut$fibers))
nut$carbs <- as.numeric(as.character(nut$carbs))
nut$cholestrol <- as.numeric(as.character(nut$cholestrol))
nut$protein <- as.numeric(as.character(nut$protein))
nut$emotion <- as.numeric(as.character(nut$emotion))

nut$healthy <- as.numeric(as.character(nut$healthy))

nut$eancode <- nut$eanstr

txns2 <- txns %>% left_join(nut,by="eancode") %>% left_join(grps,by="assgroepnr") %>% 
  mutate(finalrank=ifelse(is.na(healthy),assgroeprank,round(((healthy-5)/2+assgroeprank)/2,2))) %>%
  select(ean,finalrank,calories,sugars,sat_fat,unsat_fat,fibers,carbs,cholestrol,protein)
head(txns2)


freq <- txns %>% group_by(eancode) %>% summarize(n=n()) %>% arrange(desc(n)) %>% head(100)


profiles <- txns %>% group_by(transactienr) %>% summarize()

profiles$user <- round(runif(nrow(profiles),min=1,max=10))
dates <- seq(as.Date("2014-08-20"), as.Date("2014-09-21"), by="days")
profiles$date <- sample(dates,nrow(profiles),replace=T)


