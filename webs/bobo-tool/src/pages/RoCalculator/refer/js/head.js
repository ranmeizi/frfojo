n_Nitou=0;
n_Tensei=0;
n_Ses=0;
n_Enekyori=0;
w_AG=[100,95,90,86,82,79,76,74,72,71,70];
n_SkillSW=0;
n_Skill3SW=0;
n_Skill4SW=0;
n_Skill5SW=0;
n_Skill6SW=0;
n_Skill7SW=0;
n_IjyouSW=0;
n_KyoukaSW=0;
wBCEDPch=0;
wLAch=0;
wCriTyuu=0;
wBTw1=0;
n_TAKA_DMG=0;
TyouEnkakuSousa3dan = 0;
not_use_card = 0;
str_bSUBname = "";
str_bSUB = "";
SuperNoviceFullWeaponCHECK = 0;
cast_kotei = 0;
b = 0;
n_PerHIT_DMG = 0;
n_Delay = [0,0,0,0,0,0];
wDelay = 0;


function myInnerHtml(wIH1,wIH2,wIH3)
{
	if(wIH3 == 0){
		wIHOB = document.getElementById(wIH1);
		while(wIHOB.hasChildNodes()){
			wIHOB.removeChild(wIHOB.firstChild);
		}
		wIHOB.innerHTML = wIH2;
	}else{
		wIHOB = document.getElementById(wIH1);
		wIHOB.insertAdjacentHTML('BeforeEnd',wIH2);

	}
}

WeaponName = ["空手","短剑","单手剑","双手剑","单手枪","双手枪","单手斧","双手斧","钝器","杖","弓","拳刃","书籍","拳套","乐器","鞭","手里剑","手枪","自动步枪","霰弹枪","格林机枪","榴弹枪"];

ArrowOBJ = [
[25,0,"箭矢"],
[30,6,"银箭矢"],
[30,3,"火箭矢"],
[30,0,"铁箭矢"],
[30,2,"地灵箭矢"],
[30,1,"水灵箭矢"],
[30,4,"风灵箭矢"],
[30,7,"影子箭矢"],
[30,8,"无形箭矢"],
[30,5,"铁锈箭矢"],
[40,0,"钢铁箭矢"],
[50,0,"神之金属箭矢"],
[50,6,"破魔箭矢"],
[ 1,1,"霜冻箭矢"],
[ 1,5,"毒箭矢"],
[10,0,"锐利箭矢"],
[50,6,"神圣箭矢"],
[ 1,0,"Atk1的箭矢"]
];

ArrowOBJbackup = [
[25,0,"箭矢"],
[30,6,"银箭矢"],
[30,3,"火箭矢"],
[30,0,"铁箭矢"],
[30,2,"地灵箭矢"],
];

BulletOBJ = [
[10,0,"有声枪"],
[15,6,"神圣有声枪"],
[30,0,"血波枪"],
];

GrenadeOBJ = [
[50,3,"火焰枪"],
[50,1,"冰冻枪"],
[50,4,"雷击枪"],
[50,7,"失明枪"],
[50,5,"毒枪"],
];

SyurikenOBJ = [
[10,0,"飞镖"],
[30,0,"雨云飞镖"],
[45,0,"闪光飞镖"],
[70,0,"锐叶飞镖"],
[100,0,"刺针飞镖"],
];

KunaiOBJ = [
[30,3,"火焰飞刀"],
[30,1,"垂冰飞刀"],
[30,4,"强风飞刀"],
[30,2,"黑土飞刀"],
[30,5,"巨毒飞刀"],
];




JobEquipItemOBJ = [
[0,50,90,100,999],
[0, 1, 51,101, 70, 71, 72, 74, 75,78,83,84,85,86,87,90,91,999],
[0, 1, 52,102, 72, 74, 75,78, 80,83,84,85,90,91,999],
[0, 1, 53,103, 71, 73, 74, 77,78,85,89,999],
[0, 1, 54,104, 75, 76,83,89,999],
[0, 1, 55,105, 71, 77,89,999],
[0, 1, 56,106, 70, 71, 72, 73, 74, 75,78,83,84,85,86,90,91,999],
[0, 1, 51, 61,107, 70, 71, 72, 74, 75,78,79,83,84,85,86,87,90,91,999],
[0, 1, 52, 62,108, 72, 74, 75,78,79,81,83,84,85,90,91,999],
[0, 1, 53, 63,109, 71, 73, 74, 77,78,79,81,85,89,999],
[0, 1, 54, 64,110, 75, 76,79,80,83,88,89,999],
[0, 1, 55, 65,111, 71, 77,79,89,999],
[0, 1, 56, 66,112, 70, 71, 72, 73, 74, 75,78,79,83,84,85,86,90,91,999],
[0, 1, 51, 61,113, 70, 71, 72, 74, 75,78,79,83,84,85,86,87,90,91,999],
[0, 1, 52, 62,114, 72, 74, 75, 76,78,79,80,83,84,85,88,91,999],
[0, 1, 53, 63,115, 71, 73, 74, 77,78,79,85,89,999],
[0, 1, 54, 64,116, 74, 75, 76,79,83,89,999],
[0, 1, 54, 64,117, 74, 75, 76,79,83,89,999],
[0, 1, 55, 65,118, 71, 77,79,89,999],
[0, 1, 56, 66,119, 70, 71, 72, 73, 74, 75,78,79,83,84,85,86,90,91,999],
[0,50,90,120,999],
[0, 1, 51, 61,107,121, 70, 71, 72, 74, 75,78,79,82,83,84,85,86,87,90,91,999],
[0, 1, 52, 62,108,122, 72, 74, 75,78,79,81,82,83,84,85,90,91,999],
[0, 1, 53, 63,109,123, 71, 73, 74, 77,78,79,81,82,85,89,999],
[0, 1, 54, 64,110,124, 75, 76,79,82,83,88,89,999],
[0, 1, 55, 65,111,125, 71, 77,79,82,89,999],
[0, 1, 56, 66,112,126, 70, 71, 72, 73, 74, 75,78,79,82,83,84,85,86,90,91,999],
[0, 1, 51, 61,113,127, 70, 71, 72, 74, 75,78,79,82,83,84,85,86,87,90,91,999],
[0, 1, 52, 62,114,128, 72, 74, 75, 76,78,79,80,82,83,84,85,88,91,999],
[0, 1, 53, 63,115,129, 71, 73, 74,77,78,79,82,85,89,999],
[0, 1, 54, 64,116,130, 74, 75, 76,79,82,83,89,999],
[0, 1, 54, 64,117,131, 74, 75, 76,79,82,83,89,999],
[0, 1, 55, 65,118,132, 71,77,79,82,89,999],
[0, 1, 56, 66,119,133, 70, 71, 72, 73, 74, 75,78,79,82,83,84,85,86,90,91,999],
[0],
[0],
[0],
[0],
[0],
[0],
[0],
[0, 1,83,84,85,86,999],
[0, 1,79,83,84,85,86,87,91,999],
[0, 1, 55, 65,111, 71, 77,79,89,999],
[0, 1, 58, 52,91,999],
[0, 1, 59, 83,999],
];

SyuzokuOBJ = ["无形","不死","动物","植物","昆虫","鱼贝","恶魔","人型","天使","龙族"];
ZokuseiOBJ = ["无","水","地","火","风","毒","圣","暗","念","不死"];
SizeOBJ = ["小型","中型","大型"];
IjyouOBJ = ["中毒","晕眩","冰冻","诅咒","黑暗","睡眠","沉默","混乱","出血","石化","武器损坏","铠甲损坏"];

SubName = ["％","秒","伤害","爆击伤害","爆击率","1000回以上","无法计算","计算之外","×","咏唱时间","无","有"];

function BattleCalc999()
{
	wbairitu = 1;
	wCast = 0;
	wHITsuu = 1;	
	n_Enekyori=0;
	wLAch=0;

	w_DMG = [0,0,0];
	not_use_card = 0;
	cast_kotei = 0;

	str_PerHIT_DMG = 0;

	str_bSUBname = "";
	str_bSUB = "";



	
	if(n_A_ActiveSkill != 0 && n_A_ActiveSkill !=272 && n_A_ActiveSkill !=401 && !(n_A_ActiveSkill == 86 && (50 <= n_B[3] && n_B[3] < 60))){
		myInnerHtml("CRIATK","",0);
		myInnerHtml("CRInum","",0);
		myInnerHtml("CRIATKname","",0);
		myInnerHtml("CRInumname","",0);
	}

	
	if(n_A_WeaponType==10 && n_A_ActiveSkill==0)
		n_Enekyori=1;
	
	if((n_A_WeaponType==17||n_A_WeaponType==18||n_A_WeaponType==19||n_A_WeaponType==20||n_A_WeaponType==21)&& n_A_ActiveSkill==0)
		n_Enekyori=1;

	
	if(n_A_ActiveSkill==0 || (n_A_ActiveSkill==86 && (50 <= n_B[3] && n_B[3] < 60))){
		myInnerHtml("CRIATKname",SubName[3],0);
		myInnerHtml("CRInumname",SubName[4],0);

		if(n_A_ActiveSkill==86){
			n_Delay[0] = 1;
		}
		
		if(n_Nitou){
			TyouEnkakuSousa3dan = 0;
			
			n_A_Weapon2 = eval(document.calcForm.A_weapon2.value);
			n_A_Weapon2LV = ItemOBJ[n_A_Weapon2][4];
			n_A_Weapon2_ATK = ItemOBJ[n_A_Weapon2][3];
			n_A_Weapon2_ATKplus = eval(document.calcForm.A_Weapon2_ATKplus.value);


			n_A_Weapon2LV_seirenATK = 0;
			n_A_Weapon2LV_Minplus = 0;
			n_A_Weapon2LV_Maxplus = 0;
			if(n_A_Weapon2LV == 1){
				n_A_Weapon2LV_seirenATK = n_A_Weapon2_ATKplus * 2;
				if(n_A_Weapon2_ATKplus >= 8){
					n_A_Weapon2LV_Minplus = 1;
					n_A_Weapon2LV_Maxplus = 3 * (n_A_Weapon2_ATKplus - 7);
				}
			}else if(n_A_Weapon2LV == 2){
				n_A_Weapon2LV_seirenATK = n_A_Weapon2_ATKplus * 3;
				if(n_A_Weapon2_ATKplus >= 7){
					n_A_Weapon2LV_Minplus = 1;
					n_A_Weapon2LV_Maxplus = 5 * (n_A_Weapon2_ATKplus - 6);
				}
			}else if(n_A_Weapon2LV == 3){
				n_A_Weapon2LV_seirenATK = n_A_Weapon2_ATKplus * 5;
				if(n_A_Weapon2_ATKplus >= 6){
					n_A_Weapon2LV_Minplus = 1;
					n_A_Weapon2LV_Maxplus = 8 * (n_A_Weapon2_ATKplus - 5);
				}
			}else if(n_A_Weapon2LV == 4){
				n_A_Weapon2LV_seirenATK = n_A_Weapon2_ATKplus * 7;
				if(n_A_Weapon2_ATKplus >= 5){
					n_A_Weapon2LV_Minplus = 1;
					n_A_Weapon2LV_Maxplus = 14 * (n_A_Weapon2_ATKplus - 4);//破精炼浮动值
				}
			}

			n_A_workDEX = Math.floor(n_A_DEX * (1 + (n_A_Weapon2LV - 1) * 0.2));//DEX百分比修正

			if(n_A_workDEX>=n_A_Weapon2_ATK)
				w_left_Maxatk = n_A_ATK + n_A_Weapon2LV_Maxplus + Math.floor((n_A_Weapon2_ATK + wImp)* wCSize);
			else
				w_left_Maxatk = n_A_ATK + n_A_Weapon2LV_Maxplus + Math.floor((n_A_Weapon2_ATK-1 + wImp)* wCSize);

			w_left_Maxatk = BattleCalc4(w_left_Maxatk * wbairitu,2,1);

			if(w_left_Maxatk<1)w_left_Maxatk=1;
			w_left_Maxatk = Math.floor(w_left_Maxatk * zokusei[n_B[3]][n_A_Weapon2_zokusei]);

			
			w_left_star = 0;
			if(n_A_card[4]==106 && n_A_card[5]==106 && n_A_card[6]==106){
				w_left_star += 40;
			}else{
				for(i=4;i<=6;i++){
					if(cardOBJ[n_A_card[i]][0]==106)
						w_left_star += 5;
				}
			}
			if(n_A_card[7]==106)
				w_left_star += 10;
			w_left_Maxatk += w_left_star;
			w_left_Maxatk = w_left_Maxatk * (3 + SkillSearch(80)) /10;
			w_left_Maxatk = Math.floor(w_left_Maxatk);


			if(n_A_workDEX > n_A_Weapon2_ATK) 
				n_A_workDEX = n_A_Weapon2_ATK;
			w_left_Minatk = n_A_ATK + n_A_Weapon2LV_Minplus + Math.floor((n_A_workDEX + wImp) * wCSize);
			w_left_Minatk = BattleCalc4(w_left_Minatk * wbairitu,0,1);

			if(w_left_Minatk<1)w_left_Minatk=1;
			w_left_Minatk = Math.floor(w_left_Minatk * zokusei[n_B[3]][n_A_Weapon2_zokusei]);
			w_left_Minatk  += w_left_star;
			w_left_Minatk *= (0.3 + SkillSearch(80) /10);
			w_left_Minatk = Math.floor(w_left_Minatk);

			w_left_Aveatk = (w_left_Maxatk + w_left_Minatk) /2;

			w_left_Maxatk = tPlusDamCut(w_left_Maxatk);
			w_left_Minatk = tPlusDamCut(w_left_Minatk);
			w_left_Aveatk = tPlusDamCut(w_left_Aveatk);
			
			ATKbai02(wbairitu,0);
			n_Min_DMG += w_left_Minatk;
			n_Max_DMG += w_left_Maxatk;

			
			w_DMG[0] = BattleCalc(n_A_DMG[0],0);
			var wX = w_DMG[0] + EDP_DMG(0);
			myInnerHtml("ATK_00",wX +"("+ w_left_Minatk +")",0);
			if(w998D){
				str_bSUBname += "天使之怒<BR>";
				str_bSUB += (wX *2 + w_left_Minatk) +"～";
			}
			if(wX + w_left_Minatk < n_Min_DMG && w998G < 100)
				n_Min_DMG = wX + w_left_Minatk;
			w_DMG[0] = n_Min_DMG;

			w_DMG[2] = BattleCalc(n_A_DMG[2],2);
			var wX = w_DMG[2] + EDP_DMG(2) + w_left_Maxatk;
			myInnerHtml("ATK_02",w_DMG[2] + EDP_DMG(2) +"("+ w_left_Maxatk +")",0);
			if(w998D){
				wX = (w_DMG[2] + EDP_DMG(2)) * 2 + w_left_Maxatk;
				str_bSUB += wX +"("+ w998D +"％)<BR>";
			}
			if(wX > n_Max_DMG && w998G < 100)
				n_Max_DMG = wX;
			w_DMG[2] = n_Max_DMG;

			w_DMG[1] = BattleCalc(n_A_DMG[1],1);
			myInnerHtml("ATK_01",w_DMG[1] + EDP_DMG(1) +"("+ w_left_Aveatk +")",0);
			
			w_DMG[1] = BattleCalc3(w_DMG[1]);
			w_DMG[1] += BattleCalc3left(w_left_Aveatk);
			w_DMG[1] += EDP_DMG(1);

			EDPhyouzi(1);

			var wX = BattleCalc2(0);
			var wX2 = Math.floor(w_left_star * (0.3 + SkillSearch(80) /10));
			n_PerHIT_DMG = wX + wX2;
			str_PerHIT_DMG = wX +"+"+ wX2;

			CastAndDelay();
			BattleCalc998();
		}
		else{
			n_TAKA_DMG=0;
			wTAKA = BattleTAKA();
			TyouEnkakuSousa3dan = 0;

			if(SkillSearch(187)){
				TyouEnkakuSousa3dan = -1;
				wBC3_3danAtkBairitu = SkillSearch(187) * 0.2;
				var san = [0,0,0];
				for(var i=0;i<=2;i++){
					san[i] = BattleCalc(n_A_DMG[i] * (wbairitu + wBC3_3danAtkBairitu),i) + EDP_DMG(i);
					san[i] = Math.floor(san[i] /3) *3;
					if(n_B[19] == 5)
						san[i] = 3;
				}
				str_bSUBname += "六合拳<BR>";
				str_bSUB += san[0] +"～"+ san[2] +"("+ (30 - SkillSearch(187)) +"％)<BR>";
				TyouEnkakuSousa3dan = 0;
				if(n_Min_DMG > san[0])
					n_Min_DMG = san[0];
				if(n_Max_DMG < san[2])
					n_Max_DMG = san[2];
			}

			ATKbai02(wbairitu,0);
			for(var i=0;i<=2;i++)
				w_DMG[i] = BattleCalc(n_A_DMG[i],i);

			var w_KATARU = [0,0,0];
			var w_Ave_KATARU = 0;
			if(n_A_WeaponType == 11){
				for(i=0;i<=2;i++)
					w_KATARU[i] = Math.floor((w_DMG[i] + EDP_DMG(i)) * (0.01 + SkillSearch(13) * 0.02));
				w_Ave_KATARU = Math.floor(w_DMG[1] * (0.01 + SkillSearch(13) * 0.02));
			}

			var wX = w_DMG[0] + EDP_DMG(0) + w_KATARU[0];
			myInnerHtml("ATK_00",wX,0);
			if(n_A_WeaponType == 11)
				myInnerHtml("ATK_00",wX +"("+ (w_DMG[0] + EDP_DMG(0)) +"+"+ w_KATARU[0] +")",0);
			if(wX < n_Min_DMG && w998G < 100)
				n_Min_DMG = wX;
			if(w998D){
				if(n_A_WeaponType == 17 && SkillSearch(427)){
					if(CardNumSearch(43) || EquipNumSearch(570))
						str_bSUBname += "二刀连击<BR>";
					else
						str_bSUBname += "连锁攻击<BR>";
				}else
					str_bSUBname += "天使之怒<BR>";
				str_bSUB += wX *2 +"～";
			}
			w_DMG[0] = n_Min_DMG;

			var wX = w_DMG[2] + EDP_DMG(2) + w_KATARU[2];
			myInnerHtml("ATK_02",wX,0);
			if(n_A_WeaponType == 11)
				myInnerHtml("ATK_02",wX +"("+ (w_DMG[2] + EDP_DMG(2)) +"+"+ w_KATARU[2] +")",0);
			n_Max_DMG += n_TAKA_DMG;
			wX += n_TAKA_DMG;
			if(n_Max_DMG < wX && w998G < 100)
				n_Max_DMG = wX;
			if(w998D){
				var wX = (w_DMG[2] + EDP_DMG(2) + w_KATARU[2]) *2;
				str_bSUB += wX +"("+ w998D +"％)<BR>";
				wX += n_TAKA_DMG;
				if(n_Max_DMG < wX)
					n_Max_DMG = wX;
			}
			w_DMG[2] = n_Max_DMG;

			var wX = w_DMG[1] + EDP_DMG(1) + w_KATARU[1];
			myInnerHtml("ATK_01",wX,0);
			if(n_A_WeaponType == 11)
				myInnerHtml("ATK_01",wX +"("+ (w_DMG[1] + EDP_DMG(1)) +"+"+ w_KATARU[1] +")",0);
			if(SkillSearch(187))
				TyouEnkakuSousa3dan = san[1];
			
			w_DMG[1] += w_Ave_KATARU;
			w_DMG[1] = BattleCalc3(w_DMG[1]);
			w_DMG[1] += wTAKA;
			w_DMG[1] += EDP_DMG(1);

			EDPhyouzi(1);

			CastAndDelay();
			BattleCalc998();
		}
		return;
	}
	
	else if(n_A_ActiveSkill==272 || n_A_ActiveSkill==401){
		myInnerHtml("CRIATKname","无视防御伤害",0);
		myInnerHtml("CRInumname","无视防御率",0);

		if(n_A_ActiveSkill==272){
			n_Enekyori=1;
			wbairitu += (1 + 0.5 * n_A_ActiveSkillLV);
			wCast = 2 * n_A_CAST;
			n_Delay[2] = 1.5;
		}else{
			n_Delay[0] = 1;
			n_Enekyori=0;
			wbairitu += (n_A_ActiveSkillLV -1);
		}

		
		for(i=0;i<=2;i++)
			n_A_CriATK[i] = n_A_DMG[i];

		ATKbai02(wbairitu,1);

		wCriTyuu=1;
		for(var i=0;i<=2;i++)
			n_A_CriATK[i] = BattleCalc(n_A_CriATK[i],10);
		wCriTyuu=0;

		
		for(var i=0;i<=2;i++)
			n_A_CriATK[i] += EDP_DMG(i);

		n_Max_DMG = n_A_CriATK[2];
		myInnerHtml("CRIATK",n_A_CriATK[0] +"～"+ n_A_CriATK[2],0);

		ATKbai02(wbairitu,0);

		for(var i=0;i<=2;i++){
			w_DMG[i] = BattleCalc(n_A_DMG[i],i);
			myInnerHtml("ATK_0"+i,w_DMG[i] + EDP_DMG(i),0);
		}
		w_DMG[2] = n_Max_DMG;

		
		w_DMG[1] = BattleCalc3(w_DMG[1]);

		EDPplus(1);

		CastAndDelay();
		BattleCalc998();
		return;
	}
	
	w_ActS=[6,7,19,41,44,65,71,72,73,83,84,158,161,169,171,176,188,189,199,207,248,260,261,264,288,289,290,292,302,303,305,306,326,317,318,331,333,335,337,339,382,388,398,400,419,423,428,429,430,431,432,434,435,436,437,"NULL"];
	for(iw=0;w_ActS[iw] != n_A_ActiveSkill && w_ActS[iw] != "NULL";iw++);
	if(n_A_ActiveSkill==w_ActS[iw]){
		wActiveHitNum = 1;
		if(n_A_ActiveSkill==6)
			wbairitu += n_A_ActiveSkillLV *0.3;
		else if(n_A_ActiveSkill==7){
			wbairitu += n_A_ActiveSkillLV *0.2;
			n_A_Weapon_zokusei = 3;
			n_Delay[2] = 2;
		}else if(n_A_ActiveSkill==19){
			not_use_card = 1;
			wbairitu += 0.3;
			n_A_Weapon_zokusei = 2;
		}else if(n_A_ActiveSkill==41){
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV *0.05 - 0.25;
			n_Delay[2] = 1;
		}
		else if(n_A_ActiveSkill==44){
			n_Enekyori=1;
			wCast = 1.5;
			wbairitu += 0.5;
		}else if(n_A_ActiveSkill==65)
			wbairitu += n_A_ActiveSkillLV *0.5;
		else if(n_A_ActiveSkill==71){
			wbairitu += n_A_ActiveSkillLV *0.2;
			n_Enekyori=1;
		}else if(n_A_ActiveSkill==84){
			if(n_A_ActiveSkillLV >= 3)
				n_Enekyori=1;
			wbairitu += 0.2 * n_A_ActiveSkillLV;




		}else if(n_A_ActiveSkill==158){
			wbairitu += n_A_ActiveSkillLV *0.2;
			
		}
		else if(n_A_ActiveSkill==161){
			wbairitu += n_A_ActiveSkillLV *0.35;
			n_A_Weapon_zokusei = 6;
		}
		else if(n_A_ActiveSkill==171)
			wbairitu += n_A_ActiveSkillLV *0.4;
		else if(n_A_ActiveSkill==72){
			wbairitu += n_A_ActiveSkillLV *0.5;
			n_Delay[2] = 1;
			n_Enekyori=1;
		}else if(n_A_ActiveSkill==73){
			w = (1+n_A_ActiveSkillLV*0.2);
			if(n_A_ActiveSkillLV == 10)wbairitu += 4.625;
			else if(n_A_ActiveSkillLV >= 7)wbairitu += w+w/2+w/4-1;
			else if(n_A_ActiveSkillLV >= 4)wbairitu += w+w/2-1;
			else wbairitu += w-1;
			wCast = 0.7;
		}else if(n_A_ActiveSkill==83 || n_A_ActiveSkill==388){
			wActiveHitNum = 8;
			wbairitu += n_A_ActiveSkillLV *0.5 + 2;
			if(n_A_ActiveSkill==388 && Taijin==0)
				wbairitu *= 2;
			if(n_A_ActiveSkill==388 && Taijin==1)
				wbairitu *= 1.25;
			n_Delay[3] = 2;
		}else if(n_A_ActiveSkill==169){
			wbairitu += n_A_ActiveSkillLV *0.4 + 2;
			n_Delay[2] = 0.5;
			w_HIT = 100;
			w_HIT_HYOUJI = 100;
		}else if(n_A_ActiveSkill==176){
			wbairitu += n_A_ActiveSkillLV * 0.3;
			n_Delay[2] = 1;
		}else if(n_A_ActiveSkill==188){
			wActiveHitNum = 4;
			wbairitu += 0.5+n_A_ActiveSkillLV *0.5;
			n_Delay[0] = 1;
		}else if(n_A_ActiveSkill==189){
			wbairitu += 1.4+n_A_ActiveSkillLV *0.6;
			n_Delay[0] = 1;
		}else if(n_A_ActiveSkill==199||n_A_ActiveSkill==207){
			wCast = 1.5;
			wbairitu += (n_A_ActiveSkillLV * 0.4 - 0.4);
			n_A_Weapon_zokusei = ArrowOBJ[n_A_Arrow][1];
			if(eval(document.calcForm.A_Weapon_zokusei.value) != 0)
				n_A_Weapon_zokusei = eval(document.calcForm.A_Weapon_zokusei.value);
			n_Enekyori=1;
		}else if(n_A_ActiveSkill==248){
			not_use_card = 1;
			n_A_Weapon_zokusei = 3;
			n_Delay[0] = 1;
			wCast = 1;
			wbairitu += n_A_ActiveSkillLV *0.2;
			w_HIT = 100;
			w_HIT_HYOUJI = 100;
		}else if(n_A_ActiveSkill==260){
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV *0.4;
			n_Delay[2] = 0.5;
		}else if(n_A_ActiveSkill==261){
			n_Enekyori=1;
			wbairitu += (n_A_ActiveSkillLV *0.1 -0.5);
			if(n_A_ActiveSkillLV > 5)
				n_Delay[2] = 1;
			else
				n_Delay[2] = 0.8;
		}else if(n_A_ActiveSkill==264){
			not_use_card = 1;
			wbairitu += (n_A_ActiveSkillLV *0.4 -0.6);
			wCast = 0.5;
			n_Delay[2] = 0.5;
		}else if(n_A_ActiveSkill==288){
			wbairitu += (1 + n_A_ActiveSkillLV);
			n_Delay[2] = 0.3;
		}else if(n_A_ActiveSkill==289){
			n_Delay[0] = 1;
			wbairitu += n_A_ActiveSkillLV -0.6;


		}else if(n_A_ActiveSkill==290){
			n_Delay[0] = 1;
			wbairitu += (3 + n_A_ActiveSkillLV);
			if(n_A_ActiveSkillLV>6) n_Delay[2]=1;
			else n_Delay[2]=0.8;
		}else if(n_A_ActiveSkill==292){
			wActiveHitNum = 9;
			wbairitu += 1 + n_A_ActiveSkillLV;
			n_A_Weapon_zokusei = ArrowOBJ[n_A_Arrow][1];
			if(eval(document.calcForm.A_Weapon_zokusei.value) != 0)
				n_A_Weapon_zokusei = eval(document.calcForm.A_Weapon_zokusei.value);
			n_Enekyori=1;
			wCast = 1.8 + n_A_ActiveSkillLV *0.2;
			if(n_A_ActiveSkillLV>=6) n_Delay[2]=1;
			else n_Delay[2]=0.8;
			n_Delay[3]=3;
		}else if(n_A_ActiveSkill==302){
			n_Enekyori=1;
			not_use_card = 1;
			n_A_Weapon_zokusei = 4;
		}else if(n_A_ActiveSkill==303){
			wbairitu += (n_A_ActiveSkillLV -1) * 1;
		}else if(n_A_ActiveSkill==306){
			n_Enekyori=1;
			not_use_card = 1;
			n_A_DMG[1] += Math.floor(14.5 * wCSize);
			n_A_DMG[2] += Math.floor(29 * wCSize);
			}else if(n_A_ActiveSkill==317){
			n_Delay[0] = 1;
			n_Delay[5] = 0.05;
			if(n_B[19]==1)
				n_Delay[5] = 0.1;
			if(Taijin==1){
				str_bSUBname += "<Font size=2>SP损伤</Font><BR>";
				str_bSUB += "15<BR>";
			}
		}else if(n_A_ActiveSkill==318){
			n_Delay[5] = 0.05;
			if(n_B[19]==1)
				n_Delay[5] = 0.1;
			if(Taijin==1){
				n_Delay[0] = 1;
				str_bSUBname += "<Font size=2>SP损伤</Font><BR>";
				str_bSUB += "15<BR>";
			}
		}else if(n_A_ActiveSkill==326){
			not_use_card = 1;
			wbairitu += Math.floor((eval(document.calcForm.SkillSubNum.value) / (16 - n_A_ActiveSkillLV) / 100 -1) * 100) /100;
		}else if(n_A_ActiveSkill==382){
			not_use_card = 1;
			wbairitu += 2;


		}else if(n_A_ActiveSkill==331 || n_A_ActiveSkill==333){
			n_Delay[0] = 1;
			wbairitu += (0.6 + n_A_ActiveSkillLV * 0.2);
		}else if(n_A_ActiveSkill==335 || n_A_ActiveSkill==337){
			n_Delay[0] = 1;
			wbairitu += (0.9 + n_A_ActiveSkillLV * 0.3);
			if(n_A_ActiveSkill==337)
				wActiveHitNum = 3;
		}else if(n_A_ActiveSkill==339){
			n_Delay[0] = 1;
			if(SkillSearch(379) && n_A_WeaponType==0)
				wbairitu += (n_A_BaseLV * 0.08 - 1);
			else
				wbairitu += (-0.7 + n_A_ActiveSkillLV * 0.1);
		}else if(n_A_ActiveSkill==305){
			n_Delay[0] = 1;
			if(SkillSearch(379) && n_A_WeaponType==0)
				wbairitu += (n_A_BaseLV * 0.08 - 1);
			else
				wbairitu += (n_A_BaseLV * 0.04 - 1);
		}else if(n_A_ActiveSkill==398){
			wbairitu += (n_A_ActiveSkillLV * 0.1);
			n_Delay[2] = 3;
		}else if(n_A_ActiveSkill==400){
			n_Delay[0] = 1;
			wbairitu += (n_A_ActiveSkillLV * 0.1);
			n_Delay[2] = 1;
		}else if(n_A_ActiveSkill==419){
			not_use_card = 1;
			wCast = 0.5;
			n_Delay[2] = 1;
			n_Enekyori=1;
			wActiveHitNum = 5;
			if(n_B[2] == 2 || n_B[2] == 7)
				wbairitu += 4;
		}else if(n_A_ActiveSkill==423){
			n_Enekyori=1;
			n_Delay[2] = 0.5;
			n_A_Weapon_zokusei = 8;
			not_use_card = 1;
		}else if(n_A_ActiveSkill==428){
			n_Enekyori=1;
			wActiveHitNum = 5;
			wbairitu += n_A_ActiveSkillLV *0.5 + 4;
			n_Delay[2] = 1.7;
		}else if(n_A_ActiveSkill==429){
			n_Enekyori=0;
			wbairitu += n_A_ActiveSkillLV *0.5 - 0.5;
			n_Delay[2] = 1;
		}else if(n_A_ActiveSkill==430){
			wCast = 1 + 0.2 * n_A_ActiveSkillLV;
			cast_kotei = 1;
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV *1 +1;
			n_Delay[2] = 1;
			w_HIT = w_HIT * 5 +5;
			if(w_HIT > 100)
				w_HIT = 100;
			w_HIT_HYOUJI = w_HIT;
		}else if(n_A_ActiveSkill==431){
			wCast = 2;
			n_Delay[2] = 1;
			n_Enekyori=1;
		}else if(n_A_ActiveSkill==432){
			wCast = 1.5;
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV *0.2;
			n_Delay[2] = 0.5;
			w_HIT = 100;
			w_HIT_HYOUJI = 100;
		}else if(n_A_ActiveSkill==434){
			cast_kotei = 1;
			wCast = 1;
			n_Enekyori=0;
			wbairitu += n_A_ActiveSkillLV *0.5;
			n_Delay[3] = 1;
		}else if(n_A_ActiveSkill==435){
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV * 1 + 2;
			n_Delay[2] = 1 + n_A_ActiveSkillLV *0.2;
		}else if(n_A_ActiveSkill==436){
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV * 0.2 - 0.2;
			wCast = 1;
			n_Delay[2] = 1;
		}else if(n_A_ActiveSkill==437){
			n_Enekyori=1;
			not_use_card = 1;
			wCast = 1;
			n_Delay[2] = 1;
		}

		



		ATKbai02(wbairitu,0);

		if(cast_kotei == 0)
			wCast = wCast * n_A_CAST;

		for(var i=0;i<=2;i++){
			w_MagiclBulet = i;
			w_DMG[i] = BattleCalc(n_A_DMG[i],i);
			if(wActiveHitNum > 1)
				w_DMG[i] = Math.floor(w_DMG[i] / wActiveHitNum) * wActiveHitNum;
			myInnerHtml("ATK_0"+i,w_DMG[i] + EDP_DMG(i),0);
		}
		w_MagiclBulet = 1;
		w_DMG[1] = (w_DMG[1] * w_HIT + BattleCalc2(0) *(100-w_HIT))/100;

		EDPplus(1);

		if(cast_kotei == 0)
			CastAndDelay();
		BattleCalc998();
	}else if(n_A_ActiveSkill==275){
		n_Enekyori=1;
		wCast = 0.3;
		n_Delay[2] = 0.3;
		wCast = wCast * n_A_CAST;

		for(var i=0;i<=2;i++){
			w_DMG[i] = BattleCalc(BK_n_A_MATK[i],i);
			myInnerHtml("ATK_0"+i,w_DMG[i] + EDP_DMG(i),0);
		}
		n_PerHIT_DMG = BattleCalc2(0)+n_A_WeaponLV_seirenATK;
		w_DMG[1] = (w_DMG[1] * w_HIT + n_PerHIT_DMG *(100-w_HIT))/100;

		EDPplus(1);

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==40||n_A_ActiveSkill==70||n_A_ActiveSkill==111||n_A_ActiveSkill==192||n_A_ActiveSkill==76||n_A_ActiveSkill==418||n_A_ActiveSkill==391){
		if(n_A_ActiveSkill==40){
			n_Enekyori=1;
			wbairitu += n_A_ActiveSkillLV *0.1 -0.1;
			wHITsuu = 2;
		}else if(n_A_ActiveSkill==70){
			wbairitu += n_A_ActiveSkillLV *0.1;
			wHITsuu = n_B[4]+1;
		}else if(n_A_ActiveSkill==76){
			wbairitu += n_A_ActiveSkillLV *0.4;
			wCast = 0.7 * n_A_CAST;
			wHITsuu = 2;
			if(n_A_ActiveSkillLV == 1)
				wHITsuu = 1;
			wLAch=1;
			if(n_B_IJYOU[6] == 1){
				wHITsuu = 3;
				if(n_A_ActiveSkillLV == 1)
					wHITsuu = 2;
			}
		}else if(n_A_ActiveSkill==111){
			n_Delay[0] = 1;
			not_use_card = 1;
			n_A_Weapon_zokusei = 1;
			wHITsuu = eval(document.calcForm.SkillSubNum.value);
		}else if(n_A_ActiveSkill==192){
			wbairitu += n_A_ActiveSkillLV *0.5;
			if(n_A_JOB==15||n_A_JOB==29)
				w = SkillSearch(185);
			else
				w = n_A_PassSkill2[10];
			if(w > n_A_ActiveSkillLV){
				w = n_A_ActiveSkillLV;
			}
			wHITsuu = w;
			wCast = (1 + w) * n_A_CAST;
			n_Delay[2] = 0.5;
			n_Enekyori=1;
		}else if(n_A_ActiveSkill==418){
			n_Enekyori=1;
			n_Delay[2] = 1;
			wbairitu += 0.5;
			wHITsuu = 3;
		}else if(n_A_ActiveSkill==391){
			n_Delay[0] = 1;
			n_Enekyori=1;
			wbairitu += n_A_STR *0.08 - 0.5;
			wHITsuu = 2;
		}


		ATKbai02(wbairitu,0);

		for(var i=0;i<=2;i++){
			w_DMG[i] = BattleCalc(n_A_DMG[i],i);
			if(n_A_ActiveSkill==391 && n_B[2]!=2 && n_B[2]!=4)
				w_DMG[i] = 0;
			w_DMG[i] += EDP_DMG(i);
			if(n_B_IJYOU[6] == 0 || wLAch==0)
				myInnerHtml("ATK_0"+i,w_DMG[i] * wHITsuu + "("+ w_DMG[i] + SubName[8] +wHITsuu+"hit)",0);
			else
				myInnerHtml("ATK_0"+i,w_DMG[i] * 3 + "("+w_DMG[i] *2 +"＋"+ w_DMG[i] +")",0);
			w_DMG[i] -= EDP_DMG(i);
			w_DMG[i] *= wHITsuu;
		}
		var wX = BattleCalc2(0);
		w_DMG[1] = (w_DMG[1] * w_HIT + wX * wHITsuu *(100-w_HIT))/100;

		EDPplus(wHITsuu);

		n_PerHIT_DMG = wX * wHITsuu;
		str_PerHIT_DMG = wX * wHITsuu +"("+ wX +"×"+ wHITsuu +"hit)";

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==118 || n_A_ActiveSkill==271){
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 0;
		n_Enekyori=1;
		wBT = 80 + Math.floor(n_A_DEX /10)*2 + Math.floor(n_A_INT/2)*2 + SkillSearch(119) *6;
		if(n_A_ActiveSkill==271){
			wBT = Math.floor(wBT * (150 + 70 * n_A_ActiveSkillLV) /100);
			wBT = Math.floor(wBT * zokusei[n_B[3]][0]);
			wBT = tPlusDamCut(wBT);
			wBT *= 5;
			if(n_B[19] == 5)
				wBT = 1;
			wCast = 1 * n_A_CAST;
			n_Delay[2] = 3;
		}else{
			wBT = Math.floor(wBT * zokusei[n_B[3]][0]);
			wBT = tPlusDamCut(wBT);
			wBT *= n_A_ActiveSkillLV;
			wCast = 1.5 * n_A_CAST;
			n_Delay[2] = 1;
		}
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,wBT,0);
		w_DMG[0]=w_DMG[2]=w_DMG[1]=wBT;
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==17 || (n_A_ActiveSkill==86 && (n_B[3] < 50 ||  60 <= n_B[3]))){
		ATKbai02(wbairitu,0);
		n_A_Weapon_zokusei = 5;

		



		wINV = Math.floor(BattleCalc2(0) * zokusei[n_B[3]][5]);
		n_PerHIT_DMG = wINV;

		for(var i=0;i<=2;i++){
			w_DMG[i] = BattleCalc(n_A_DMG[i],i);
			w_DMG[i] = Math.floor(w_DMG[i] * zokusei[n_B[3]][5]);
			myInnerHtml("ATK_0"+i,w_DMG[i] + EDP_DMG(i),0);
		}
		w_DMG[1] = (w_DMG[1] * w_HIT + wINV *(100-w_HIT))/100;

		EDPplus(1);




		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==159 || n_A_ActiveSkill==384)
	{
		n_PerHIT_DMG = 0;
		n_Enekyori=1;
		n_A_Weapon_zokusei = 0;
		n_Delay[2] = 0.7;
		if(n_A_ActiveSkill==384)
			n_Delay[2] = 0.35;
		wSBr = n_A_LEFT_DEF_PLUS *4;

		wbairitu2 = (1 + n_A_ActiveSkillLV *0.3);
		if(n_A_ActiveSkill==384)
			wbairitu2 *= 2;

		n_A_ATK_w = Math.round(Math.floor(n_A_STR/10) * Math.floor(n_A_STR/10));
		n_A_ATK   = n_A_STR + n_A_ATK_w + Math.floor(n_A_DEX / 5) + Math.floor(n_A_LUK / 5);

		for(var i=0;i<=2;i++){
			w_DMG[i] = n_A_ATK * wbairitu + ItemOBJ[n_A_Equip[5]][6] + wSBr;
			w_DMG[i] = Math.floor(Math.floor(w_DMG[i] * (100 - n_B[14]) /100 - n_B_DEF2[i]) * wbairitu2);
			w_DMG[i] = BaiCI(w_DMG[i]);
			if(w_DMG[i] < 1)w_DMG[i] = 1;
			w_DMG[i] = Math.floor(w_DMG[i] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+i,w_DMG[i],0);
		}
		w_DMG[1] = (w_DMG[1] * w_HIT)/100;

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==324)
	{
		n_PerHIT_DMG = 0;
		n_Enekyori=1;
		n_A_Weapon_zokusei = 0;
		wCast = 1 * n_A_CAST;
		n_Delay[2] = 1;
		wSBr = n_A_LEFT_DEF_PLUS;
		wSC  = ItemOBJ[n_A_Equip[5]][6];

		wbairitu2 = (1 + n_A_ActiveSkillLV *0.3);

		n_A_ATK_w = Math.round(Math.floor(n_A_STR/10) * Math.floor(n_A_STR/10));
		n_A_ATK   = n_A_STR + n_A_ATK_w + Math.floor(n_A_DEX / 5) + Math.floor(n_A_LUK / 5);
		n_A_ATK   = n_A_ATK * wbairitu + wSC + wSBr * 4;

		wSC -= 100;
		if(wSC < 0)
			wSC = 0;
		wSC2 = [0,0,0];
		wSC2[2] = 100 + wSC + (wSBr * 2) * wSBr;
		wSC2[1] = 100 + (wSC + (wSBr * 2) * wSBr)/2;
		wSC2[0] = 100

		for(var i=0;i<=2;i++){
			w_DMG[i] = (n_A_ATK * (100 - n_B[14]) /100 - n_B_DEF2[i]) * wbairitu2;
			w_DMG[i] += wSC2[i];
			w_DMG[i] = BaiCI(w_DMG[i]);
			if(w_DMG[i] < 1)w_DMG[i] = 1;
			w_DMG[i] = Math.floor(w_DMG[i] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+i,w_DMG[i] * 5 +"("+w_DMG[i]+ SubName[8] +"5hit)",0);
			w_DMG[i] *= 5;
		}
		w_DMG[1] = (w_DMG[1] * w_HIT)/100;

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==259)
	{
		n_Enekyori=1;

		wSPP2 = n_A_WeaponLV_seirenATK * zokusei[n_B[3]][n_A_Weapon_zokusei];
		wSPP2 = BaiCI(wSPP2);
		wSPP2 = tPlusDamCut(wSPP2);
		n_PerHIT_DMG = wSPP2 * 5;

		if(n_A_ActiveSkillLV == 5)
			wCast = 1 * n_A_CAST;
		else
			wCast = (0.1 + 0.2 * n_A_ActiveSkillLV) * n_A_CAST;
		n_Delay[2] = 1+ 0.2 * n_A_ActiveSkillLV;

		wSPP = Math.floor(n_A_STR / 10);
		w_DMG[2] = wSPP * wSPP + ItemOBJ[n_A_Equip[0]][6] * 0.8 * (1 + 0.5 * n_A_ActiveSkillLV);
		wSPP = 1.25 -(n_B[4] * 0.25);
		w_DMG[2] = Math.floor(w_DMG[2] * wSPP + n_A_WeaponLV_seirenATK);
		w_DMG[2] = w_DMG[2] * zokusei[n_B[3]][n_A_Weapon_zokusei];
		w_DMG[2] = BaiCI(w_DMG[2]);
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++){
			myInnerHtml("ATK_0"+i,(w_DMG[i] + EDP_DMG(i)) * 5 + "("+(w_DMG[i] + EDP_DMG(i))+ SubName[8] +5+"hit)",0);
			w_DMG[i] *= 5;
		}
		w_DMG[1] = w_DMG[1] * w_HIT /100 + n_PerHIT_DMG * (100- w_HIT)/100;

		EDPplus(5);
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==88)
	{
		n_PerHIT_DMG = 0;
		not_use_card = 1;
		n_Delay[0] = 1;
		wCast = 1 * n_A_CAST;

		if(n_B[19] == 0){

			wbairitu += (400 + 50 * n_A_ActiveSkillLV + 20 * eval(document.calcForm.SkillSubNum.value)) /100;
			ATKbai02(wbairitu,0);


			for(var i=0;i<=2;i++){
				w_DMG[i] = BattleCalc(n_A_DMG[i],i);
				w_DMG[i] = Math.floor(w_DMG[i]);
			}
		}else if(n_B[19] == 5){
			w_DMG[0] = w_DMG[1] = w_DMG[2] = 1;
		}else{
			w_DMG[0] = w_DMG[1] = w_DMG[2] = 0;
		}
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==263)
	{
		not_use_card = 1;
		n_Enekyori=1;
		wCast = 0.5 * n_A_CAST;
		n_Delay[2] = 0.8 + 0.2 * n_A_ActiveSkillLV;

		w_SBr = new Array();
		w = n_A_INT * 5 * n_A_ActiveSkillLV;
		w_SBr[2] = w + 1000 - Math.floor((n_B[14] + n_B[15] + n_B_MDEF2 + n_B_DEF2[2])/2);
		w_SBr[1] = w + 750 - Math.floor((n_B[14] + n_B[15] + n_B_MDEF2 + n_B_DEF2[1])/2);
		w_SBr[0] = w + 500 - Math.floor((n_B[14] + n_B[15] + n_B_MDEF2 + n_B_DEF2[0])/2);
		for(var i=0;i<=2;i++)
			w_SBr[i] = tPlusDamCut(w_SBr[i]);

		for(var i=0;i<=2;i++){
			w_DMG[i] = BattleCalc(n_A_DMG[i],i);
			w_DMG[i] *= n_A_ActiveSkillLV;
			myInnerHtml("ATK_0"+i,w_DMG[i] + w_SBr[i] +"("+ w_DMG[i] +"+"+ w_SBr[i] +")",0);
			w_DMG[i] += w_SBr[i];
		}
		var wX = BattleCalc2(0);
		n_PerHIT_DMG = wX + w_SBr[1];
		str_PerHIT_DMG = (wX + w_SBr[0]) +"～"+ (wX + w_SBr[2]);
		if(n_B[19] == 5){
			for(var i=0;i<=2;i++){
				w_DMG[i] = 1;
				myInnerHtml("ATK_0"+i,w_DMG[i],0);
			}
		}
		w_DMG[1] = (w_DMG[1] * w_HIT + n_PerHIT_DMG *(100-w_HIT))/100;

		CastAndDelay();
		BattleCalc998();
	}

	
	else if(n_A_ActiveSkill==162)
	{
		n_PerHIT_DMG = 0;
		
		myInnerHtml("CRIATKname",'<Font color="#FF0000">发动伤害</Font>',0);
		myInnerHtml("CRIATK",'<Font color="#FF0000">'+ Math.floor(n_A_MaxHP /5) +"</Font>",0);

		myInnerHtml("CRInumname",'<Font color="#FF0000">反噬伤害</Font>',0);

		
		work_A_VITDEF = [0,0,0];
		work_A_VITDEF[0] = n_A_VITDEF[2];
		work_A_VITDEF[1] = n_A_VITDEF[1];
		work_A_VITDEF[2] = n_A_VITDEF[0];
		n_A_INTMDEF = n_A_INT + Math.floor(n_A_VIT /2);

		for(var i=0;i<=2;i++){
			w_DMG[i] = BK_n_A_DMG[i] * (100 - n_A_DEF) /100 - work_A_VITDEF[i] + n_A_WeaponLV_seirenATK;
			w_DMG[i] = Math.floor(w_DMG[i] * (wbairitu + n_A_ActiveSkillLV * 0.4));

			w = BK_n_A_MATK[i] *(100 - n_A_MDEF)/100 - n_A_INTMDEF;
			w = Math.floor(w * (n_A_ActiveSkillLV * 0.4 +1));

			w_DMG[i] += w;
			w_DMG[i] = Math.floor(w_DMG[i] * (100-n_tok[57]) /100);
			w_DMG[i] = Math.floor(w_DMG[i] * (100-n_tok[66]) /100);
			w_DMG[i] = Math.floor(w_DMG[i] * (100-n_tok[78]) /100);
			if(eval(document.calcForm.A_youshi.checked))
				w_DMG[i] = Math.floor(w_DMG[i] * (100-n_tok[190]) /100);
			else
				w_DMG[i] = Math.floor(w_DMG[i] * (100-n_tok[191]) /100);
			w_DMG[i] = Math.floor(w_DMG[i] * zokusei[n_A_BodyZokusei * 10 +1][6]);
			
			w_DMG[i] = Math.floor(w_DMG[i] /2);
		}
		myInnerHtml("CRInum",'<Font color="#FF0000">'+ w_DMG[0] +"×3hit～"+ w_DMG[2] +"×3hit</Font>",0);
		

		n_Enekyori=2;
		n_A_Weapon_zokusei = 6;
		wCast = 3 * n_A_CAST;
		n_Delay[2] = 1.5;
		wLAch=1;

		for(var i=0;i<=2;i++){
			w_DMG[i] = BK_n_A_DMG[i] * (100 - n_B[14]) /100 - n_B_DEF2[i] + n_A_WeaponLV_seirenATK;
			w_DMG[i] *= wbairitu + n_A_ActiveSkillLV * 0.4;
			w_DMG[i] = Math.floor(w_DMG[i] * zokusei[n_B[3]][6]);
			w = BK_n_A_MATK[i] *(100 - n_B[15])/100 -n_B_MDEF2;
			w *= (n_A_ActiveSkillLV * 0.4 +1);
			w = Math.floor(w * zokusei[n_B[3]][6]);
			w_DMG[i] = tPlusDamCut(Math.floor((w+w_DMG[i])*zokusei[n_B[3]][6]));
			if(w_DMG[i] < 1)w_DMG[i]=1;
			if(60<=n_B[3]&&n_B[3]<=69)w_DMG[i]=0;
		}

		if(n_B_IJYOU[6] == 0){
			for(var b=0;b<=2;b++){
				myInnerHtml("ATK_0"+b,w_DMG[b] * 3 + "("+w_DMG[b]+ SubName[8] +"3hit)",0);
				w_DMG[b] *= 3;
			}
		}else{
			for(var b=0;b<=2;b++){
				myInnerHtml("ATK_0"+b,w_DMG[b] * 4 + "("+ w_DMG[b] *2 +"＋" +w_DMG[b]+ SubName[8] +"2hit)",0);
				w_DMG[b] *= 4;
			}
		}
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==66)
	{
		wCR = 100;
		n_PerHIT_DMG = Math.floor(BattleCalc2(0) * 2 * zokusei[n_B[3]][0]);
		
		if(SkillSearch(327)){
			wCR += 20 * SkillSearch(327);
		}
		else{
			if(SkillSearch(154))
				wCR += SkillSearch(154) * 5;
			if(SkillSearch(154)==0 && n_A_PassSkill2[8])
				wCR += n_A_PassSkill2[8] * 5 / 10;
		}
		CR_n_A_DMG = [0,0,0];

		CRbai = eval(document.calcForm.SkillSubNum.value) / 8000;
		for(b=0;b<=2;b++)
			CR_n_A_DMG[b] = Math.floor(n_A_DMG[b] * wCR / 100);

		wbairitu += 0.5;
		ATKbai02(wbairitu,0);

		for(var b=0;b<=2;b++){
			w_DMG[b] = BattleCalc(n_A_DMG[b],b);
			w_DMG[b] += Math.floor(BattleCalc(CR_n_A_DMG[b],b) * CRbai);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+b,w_DMG[b] + EDP_DMG(b),0);
		}
		w_DMG[1] = (w_DMG[1] * w_HIT + BattleCalc2(0) * 2 *(100-w_HIT))/100;
		w_DMG[1] = Math.floor(w_DMG[1] * zokusei[n_B[3]][0]);

		EDPplus(1);

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==283)
	{
		n_PerHIT_DMG = 0;
		w_DMG[2] = 500 + 300 * n_A_ActiveSkillLV;
		if(n_B[19] == 5)
			w_DMG[2] = 1;
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);

		wCast = (1.5+ 0.5 * n_A_ActiveSkillLV) * n_A_CAST;
		n_Delay[2] = 1.5 + n_A_ActiveSkillLV *0.5;
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==284)
	{
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 0;
		w_DMG[2] = Math.floor(n_A_MaxHP * 0.09 * (0.9 + 0.1 * n_A_ActiveSkillLV));
		w_DMG[2] = BaiCI(w_DMG[2]);
		w_DMG[2] = Math.floor(w_DMG[2] * zokusei[n_B[3]][0]);
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);

		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==193)
	{
		n_PerHIT_DMG = 0;
		w_HIT_HYOUJI = 100;
		n_A_Weapon_zokusei = 0;
		ATKbai02(wbairitu,0);
		wbairitu += n_A_ActiveSkillLV *0.75;

		
		work_B_DEF2 = [0,0,0];
		work_B_DEF2[0] = n_B_DEF2[2];
		work_B_DEF2[1] = n_B_DEF2[1];
		work_B_DEF2[2] = n_B_DEF2[0];

		for(var b=0;b<=2;b++){
			w_DMG[b] = Math.floor(Math.floor(BK_n_A_DMG[b] * wbairitu) * (work_B_DEF2[b]+n_B[14]) /50);
			w_DMG[b] = BaiCI(w_DMG[b]);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+b,w_DMG[b] + EDP_DMG(b),0);
		}

		EDPplus(1);

		wCast = 1 * n_A_CAST;
		n_Delay[2] = 0.5;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==197 || n_A_ActiveSkill==321)
	{
		n_PerHIT_DMG = 0;
		w_HIT_HYOUJI = 100;
		n_A_Weapon_zokusei = 0;
		ATKbai02(wbairitu,0);
		if(n_A_ActiveSkill==197)
			wbairitu += 7 + eval(document.calcForm.SkillSubNum.value) /10;
		else
			wbairitu += 7 + (n_A_MaxSP-1) /10;
		wASYU = 250 + n_A_ActiveSkillLV * 150;

		for(var b=0;b<=2;b++){
			w_DMG[b] = Math.floor(BK_n_A_DMG[b] * wbairitu) + wASYU;
			w_DMG[b] = BaiCI(w_DMG[b]);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+b,w_DMG[b] + EDP_DMG(b),0);
		}

		EDPplus(1);

		wCast = (4.5 - 0.5 * n_A_ActiveSkillLV) * n_A_CAST;
		n_Delay[2] = 3.5 - 0.5 * n_A_ActiveSkillLV;
		CastAndDelay();

		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==394){
		n_Enekyori=1;
		not_use_card = 1;
		ATKbai02(wbairitu,0);

		for(var b=0;b<=2;b++){
			w_DMG[b] = BattleCalc(n_A_DMG[b],b);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+b,w_DMG[b],0);
		}
		w_DMG[1] = (w_DMG[1] * w_HIT + BattleCalc2(0) * zokusei[n_B[3]][0] *(100-w_HIT))/100;
		n_PerHIT_DMG = BattleCalc2(0) * zokusei[n_B[3]][0];

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==395){
		n_Enekyori=1;
		n_Delay[2] = 2.5;
		not_use_card = 1;
		ATKbai02(wbairitu,0);

		n_A_Weapon_zokusei = KunaiOBJ[eval(document.calcForm.SkillSubNum.value)][1];

		for(var b=0;b<=2;b++){
			w_DMG[b] = BattleCalc(n_A_DMG[b],b);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			myInnerHtml("ATK_0"+b,w_DMG[b] * 3 + "("+ w_DMG[b] + SubName[8] +"3hit)",0);
			w_DMG[b] *= 3;
		}
		var wX = Math.floor(BattleCalc2(0) * zokusei[n_B[3]][0]);
		w_DMG[1] = (w_DMG[1] * w_HIT + wX * 3 *(100-w_HIT))/100;
		n_PerHIT_DMG = wX * 3;
		str_PerHIT_DMG = wX * 3 +"("+ wX +"亊3hit)"

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==396){
		wbairitu += (n_A_ActiveSkillLV * 1.5 +0.5);
		n_Enekyori=1;
		ATKbai02(wbairitu,0);
		wCast = 3 * n_A_CAST;
		n_Delay[2] = 3;
		wActiveHitNum = 2 + Math.round(n_A_ActiveSkillLV / 2);

		for(var b=0;b<=2;b++){
			w_DMG[b] = BattleCalc(n_A_DMG[b],b);
			w_DMG[b] = Math.floor(w_DMG[b] * zokusei[n_B[3]][0]);
			if(wActiveHitNum > 1)
				w_DMG[b] = Math.floor(w_DMG[b] / wActiveHitNum) * wActiveHitNum;
			myInnerHtml("ATK_0"+b,w_DMG[b],0);
		}
		w_DMG[1] = (w_DMG[1] * w_HIT + BattleCalc2(0)* zokusei[n_B[3]][0] *(100-w_HIT))/100;
		n_PerHIT_DMG = BattleCalc2(0) * zokusei[n_B[3]][0];

		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==405 || n_A_ActiveSkill==438)
	{
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 0;
		n_Enekyori=1;
		ATKbai02(wbairitu,0);
		if(n_A_ActiveSkill==405)
			w_1senHP = eval(document.calcForm.SkillSubNum.value);
		else
			w_1senHP = n_A_MaxHP -1;

		w_DMG[0] = (n_A_STR + n_A_ActiveSkillLV) * 40 + w_1senHP * (n_A_BaseLV / 100) * n_A_ActiveSkillLV / 10;
		w_DMG[0] = w_DMG[0] * (100 - n_B[14]) / 100;
		w_DMG[0] = BaiCI(w_DMG[0]);
		w_DMG[0] = Math.floor(w_DMG[0] * zokusei[n_B[3]][0]);

		w_DMG[2] = w_DMG[1] = w_DMG[0];
		for(var b=0;b<=2;b++)
			myInnerHtml("ATK_0"+b,w_DMG[b],0);

		CastAndDelay();

		w_HIT_HYOUJI = 100;
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==244)
	{
		n_PerHIT_DMG = 0;
		n_Enekyori=1;
		n_A_Weapon_zokusei = 0;
		wbairitu = (50 + n_A_ActiveSkillLV * 50) /100;

		for(var b=0;b<=2;b++){
			w_DMG[b] = Math.floor((BK_n_A_DMG[b] - n_B_DEF2[b]) * wbairitu);
			w_DMG[b] = tPlusDamCut(Math.floor(w_DMG[b] * zokusei[n_B[3]][0]));
			myInnerHtml("ATK_0"+b,w_DMG[b],0);
		}

		wCast = 1 * n_A_CAST;
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==328)
	{
		n_PerHIT_DMG = 0;
		n_Enekyori=1;
		n_A_Weapon_zokusei = 0;
		wHITsuu = n_A_ActiveSkillLV;

		wAD = 0.7 * n_A_INT * n_A_INT * n_B[7] / (n_A_INT + n_B[7]);
		w_DMG[2] = Math.floor(wAD);
		w_DMG[2] = tPlusDamCut(Math.floor(w_DMG[2] * zokusei[n_B[3]][0]));
		if(Taijin==1)
			w_DMG[2] = Math.floor(w_DMG[2] /2);
		myInnerHtml("ATK_02",w_DMG[2] * wHITsuu + "("+ w_DMG[2] + SubName[8] +wHITsuu+"hit)",0);
		myInnerHtml("ATK_00",w_DMG[2] * wHITsuu + "("+ w_DMG[2] + SubName[8] +wHITsuu+"hit)",0);
		myInnerHtml("ATK_01",w_DMG[2] * wHITsuu + "("+ w_DMG[2] + SubName[8] +wHITsuu+"hit)",0);
		w_DMG[2] *= wHITsuu;
		w_DMG[0] = w_DMG[2];
		w_DMG[1] = w_DMG[2];

		wCast = 1 * n_A_CAST;
		n_Delay[2] = 1;
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==106 || n_A_ActiveSkill==112 || n_A_ActiveSkill==113){
		n_PerHIT_DMG = 0;
		n_Delay[0] = 1;
		if(n_A_ActiveSkill==106){
			n_A_Weapon_zokusei = 2;
			w_DMG[2] = Math.floor((75 + n_A_DEX) * (1+ n_A_INT /100) * n_A_ActiveSkillLV * zokusei[n_B[3]][2]);
		}
		else if(n_A_ActiveSkill==112){
			n_A_Weapon_zokusei = 4;
			w_DMG[2] = Math.floor((50 + n_A_DEX/2) * (1+ n_A_INT /100) * n_A_ActiveSkillLV * zokusei[n_B[3]][4]) * eval(document.calcForm.SkillSubNum.value);
		}
		else if(n_A_ActiveSkill==113){
			n_A_Weapon_zokusei = 3;
			w_DMG[2] = Math.floor((75 + n_A_DEX/2) * (1+ n_A_INT /100) * n_A_ActiveSkillLV * zokusei[n_B[3]][3]) * eval(document.calcForm.SkillSubNum.value);
		}

		w_DMG[2] = tPlusDamCut(w_DMG[2]);
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);

		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==25){
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 6;
		n_Delay[2] = 1;
		n_Enekyori=2;
		w_DMG[2] = HealCalc(n_A_ActiveSkillLV,0);
		w_DMG[2] = Math.floor(Math.floor(w_DMG[2] / 2) * zokusei[n_B[3]][6]);
		if(n_B[3] < 90){
			w_DMG[2]=0;
		}

		wHealBAI = 100 + n_tok[93];
		
		w_DMG[2] = Math.floor(w_DMG[2] * wHealBAI /100);
		
		w_DMG[2] = tPlusDamCut(w_DMG[2]);
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);

		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==94){
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 6;
		wCast = 5 * n_A_CAST;
		n_Delay[0] = 1;
		n_Enekyori=2;
		if(n_A_ActiveSkillLV <= 6)
			w_DMG[2] = 100 * n_A_ActiveSkillLV;
		else
			w_DMG[2] = 777;

		w_HEAL_BAI = 100 + n_tok[94];
		w_DMG[2] = Math.floor(w_DMG[2] * w_HEAL_BAI / 100);

		w_DMG[2] = Math.floor(Math.floor(w_DMG[2] / 2) * zokusei[n_B[3]][6]);
		if(n_B[3] < 90 && n_B[2] != 6)
			w_DMG[2]=0;
		if(n_B[2] != 6 && n_B[2] != 1)
			w_DMG[2]=0;

		w_HEAL_BAI = 100 + n_tok[96];
		w_DMG[2] = Math.floor(w_DMG[2] * w_HEAL_BAI / 100);

		w_DMG[2] = tPlusDamCut(w_DMG[2]);
		w_DMG[0] = w_DMG[1] = w_DMG[2];
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,w_DMG[i],0);

		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==102 || n_A_ActiveSkill==97){
		n_PerHIT_DMG = 0;
		if(n_A_ActiveSkill==102){
			n_A_Weapon_zokusei = 6;
			wCast = 1 * n_A_CAST;
		}else{
			n_A_Weapon_zokusei = 0;
			wCast = 8 - n_A_ActiveSkillLV * 2;
			wCast = wCast * n_A_CAST;
		}
		n_Enekyori=2;
		if(n_B[3] < 90){
			w = 0;
			w_DMG[2] = 0;
			w_DMG[0] = 0;
			w_DMG[1] = 0;
		}else{
			if(n_B[19] != 1){
				w = (20 * n_A_ActiveSkillLV + n_A_BaseLV + n_A_INT +n_A_LUK)/1000;
				w_DMG[2] = n_B[6];
			}
			else{
				w = 0;
				w_DMG[2] = 0;
			}
			w_DMG[0] = n_A_BaseLV + n_A_INT + n_A_ActiveSkillLV *10;
			w_DMG[0] = Math.floor(w_DMG[0] * zokusei[n_B[3]][n_A_Weapon_zokusei]);
			w_DMG[1] = Math.round((n_B[6] * w + w_DMG[0] * (100-w)/100));
		}
		myInnerHtml("ATK_02",Math.floor(w_DMG[2] * zokusei[n_B[3]][n_A_Weapon_zokusei]) +"(成功机率" +Math.round(w *10000)/100 +"%)",0);
		myInnerHtml("ATK_00",w_DMG[0] +"(失败伤害)",0);
		myInnerHtml("ATK_01",w_DMG[1] +"(单发预估)",0);

		n_Delay[2] = 3;
		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
	
	else if(n_A_ActiveSkill==325){
		n_PerHIT_DMG = 0;
		n_A_Weapon_zokusei = 0;
		n_Delay[0] = 1;
		n_Enekyori=2;
		wHITsuu = 4 + n_A_ActiveSkillLV;
		w_DMG[2] = 200 + 200 * n_A_ActiveSkillLV;

		w_DMG[2] = Math.floor(w_DMG[2]);

		if(n_B[19] == 5)
			w_DMG[2] = 1;
		if(n_B[0] == 44)
			w_DMG[2] = 400;
		var wStrG = w_DMG[2] * wHITsuu +"("+ w_DMG[2] +"×"+ wHITsuu +"hit)"
		for(var i=0;i<=2;i++)
			myInnerHtml("ATK_0"+i,wStrG,0);

		w_DMG[2] = w_DMG[2] * wHITsuu;
		w_DMG[0] = w_DMG[1] = w_DMG[2];

		wCast = 5 * n_A_CAST;
		n_Delay[2] = 2;
		w_HIT_HYOUJI = 100;
		CastAndDelay();

		BattleCalc998();
	}
	
	else
	{
		n_PerHIT_DMG = 0;
		n_Enekyori=2;
		wbairitu = 1;
		if(n_A_ActiveSkill==51){
			n_A_Weapon_zokusei = 3;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 0.7 * n_A_ActiveSkillLV;
			n_Delay[2] = 0.8 + n_A_ActiveSkillLV * 0.2;
		}
		else if(n_A_ActiveSkill==54){
			n_A_Weapon_zokusei = 1;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 0.7 * n_A_ActiveSkillLV;
			n_Delay[2]= 0.8 + n_A_ActiveSkillLV * 0.2;
		}
		else if(n_A_ActiveSkill==56){
			n_A_Weapon_zokusei = 4;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 0.7 * n_A_ActiveSkillLV;
			n_Delay[2] = 0.8 + n_A_ActiveSkillLV * 0.2;
		}
		else if(n_A_ActiveSkill==52){
			n_A_Weapon_zokusei = 3;
			if(n_A_ActiveSkillLV <=5){
				wCast = 1.5;
				n_Delay[2] = 1.5;
			}else{
				wCast = 1;
				n_Delay[2] = 1;
			}
			wbairitu = 0.7 + n_A_ActiveSkillLV * 0.1;
		}
		else if(n_A_ActiveSkill==53){
			n_A_Weapon_zokusei = 3;
			wHITsuu = 4 + n_A_ActiveSkillLV;
			wCast = 2.15 - (n_A_ActiveSkillLV * 0.15);
			n_Delay[2] = 0.1;
			wbairitu = 0.5;
		}
		else if(n_A_ActiveSkill==55){
			n_A_Weapon_zokusei = 1;
			wCast = 0.8;
			n_Delay[2] = 1.5;
			wbairitu = 1 + n_A_ActiveSkillLV * 0.1;
		}
		else if(n_A_ActiveSkill==57){
			n_A_Weapon_zokusei = 4;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 1 * n_A_ActiveSkillLV;
			n_Delay[2] = 2;
			wbairitu = 0.8;
		}
		else if(n_A_ActiveSkill==46){
			n_A_Weapon_zokusei = 8;
			wCast = 0.5;
			if(n_A_ActiveSkillLV==10)
				n_Delay[2] = 0.5;
			else if(n_A_ActiveSkillLV==9)
				n_Delay[2] = 0.6;
			else if(n_A_ActiveSkillLV==8)
				n_Delay[2] = 0.7;
			else if(n_A_ActiveSkillLV>=6)
				n_Delay[2] = 0.8;
			else if(n_A_ActiveSkillLV>=4)
				n_Delay[2] = 0.9;
			else
				n_Delay[2] = 1;
			wbairitu = 0.7 + n_A_ActiveSkillLV * 0.1;
		}
		else if(n_A_ActiveSkill==47){
			n_A_Weapon_zokusei = 8;
			wHITsuu = Math.round(n_A_ActiveSkillLV / 2);
			wCast = 0.5;
			if(n_A_ActiveSkillLV % 2 == 0)
				n_Delay[2] = 0.8 + n_A_ActiveSkillLV / 2 *0.2;
			else
				n_Delay[2] = 1 + (n_A_ActiveSkillLV+1) / 2 *0.2;
		}
		else if(n_A_ActiveSkill==122){
			n_A_Weapon_zokusei = 3;
			wHITsuu = (n_A_ActiveSkillLV +2) * eval(document.calcForm.SkillSubNum.value);
			wCast = 3.3 - (0.3 * n_A_ActiveSkillLV);
			n_Delay[2] = 1;
			wbairitu = 0.2;
		}
		else if(n_A_ActiveSkill==124){
			n_A_Weapon_zokusei = 3;
			wCast = 0.7;
			n_Delay[2] = 2;
			wbairitu = 1 + n_A_ActiveSkillLV * 0.2;
		}
		else if(n_A_ActiveSkill==125){
			n_A_Weapon_zokusei = 3;
			wHITsuu = Math.round(n_A_ActiveSkillLV / 2) * (Math.floor(n_A_ActiveSkillLV / 2) + 2);
			wCast = 15;
			n_Delay[1] = 0;
			n_Delay[2] = Math.floor(n_A_ActiveSkillLV / 2) * 1 +2;
		}
		else if(n_A_ActiveSkill==126){
			n_A_Weapon_zokusei = 4;
			wHITsuu = n_A_ActiveSkillLV + 2;
			wCast = 2 + n_A_ActiveSkillLV * 0.5;
		}
		else if(n_A_ActiveSkill==127){
			n_A_Weapon_zokusei = 4;
			wHITsuu = 4;
			wCast = 15.5 - n_A_ActiveSkillLV * 0.5;
			n_Delay[2] = 5;
			wbairitu = 0.8 + n_A_ActiveSkillLV * 0.2;
		}
		else if(n_A_ActiveSkill==128 || n_A_ActiveSkill==320){
			n_A_Weapon_zokusei = 1;
			if(n_A_ActiveSkillLV >= 4)
				wHITsuu = 25
			else if(n_A_ActiveSkillLV >= 2)
				wHITsuu = 9;
			wCast = n_A_ActiveSkillLV;
			wbairitu = 1 + n_A_ActiveSkillLV * 0.3;
			n_Delay[3] = 0.1 * wHITsuu;
		}
		else if(n_A_ActiveSkill==130){
			wbairitu = 0.66 + n_A_ActiveSkillLV * 0.066;
			n_A_Weapon_zokusei = 1;
			wCast = 6 - Math.floor((n_A_ActiveSkillLV-1) /2) * 0.5;
			n_Delay[2] = 1;
		}
		else if(n_A_ActiveSkill==131){
			n_A_Weapon_zokusei = 1;
			wHITsuu = eval(document.calcForm.SkillSubNum.value);
			wCast = 5 + n_A_ActiveSkillLV;
			n_Delay[2] = 5;
			wbairitu = 1 + n_A_ActiveSkillLV * 0.4;
		}
		else if(n_A_ActiveSkill==132 || n_A_ActiveSkill==133 || n_A_ActiveSkill==319){
			n_A_Weapon_zokusei = 2;
			wHITsuu = n_A_ActiveSkillLV;
			if(n_A_ActiveSkill==132){
				wCast = n_A_ActiveSkillLV *0.7;
				n_Delay[2] = 0.8 + n_A_ActiveSkillLV * 0.2;
			}
			else{
				wCast = n_A_ActiveSkillLV;
				n_Delay[2] = 1;
			}
		}
		else if(n_A_ActiveSkill==277){
			wHITsuu = n_A_ActiveSkillLV;
			n_A_Weapon_zokusei = 8;
			wCast = 1;
			n_Delay[2] = 1;
			wbairitu = 0.7 + n_A_ActiveSkillLV * 0.1;
		}
		else if(n_A_ActiveSkill==37 || n_A_ActiveSkill==387){
			n_A_Weapon_zokusei = 6;
			wCast = 2;
			wbairitu = 1.25;
			if(n_A_ActiveSkill==387)
				wbairitu *= 5;
		}
		else if(n_A_ActiveSkill==104){
			n_Delay[0] = 1;
			n_A_Weapon_zokusei = 6;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 15;
			n_Delay[2] = 4;
			if(n_B[2] != 6 && n_B[3] < 90){
				n_A_MATK[2]=0;n_A_MATK[0]=0;n_A_MATK[1]=0;
			}
		}else if(n_A_ActiveSkill==373){
			n_A_Weapon_zokusei = eval(document.calcForm.A_Weapon_zokusei.value);
			wCast = 0.1;
			n_Delay[2] = 0.5;
			if(n_B[4] == 0)
				wbairitu = n_A_ActiveSkillLV * 0.1;
			else
				wbairitu = 0.01;
			if(Taijin==1)
				wbairitu = 0;
		}
		else if(n_A_ActiveSkill==374){
			n_A_Weapon_zokusei = eval(document.calcForm.A_Weapon_zokusei.value);
			wCast = 0.1;
			n_Delay[2] = 0.5;

				wbairitu = n_A_ActiveSkillLV * 0.05;


			if(Taijin==1)
				wbairitu = 0;
		}
		else if(n_A_ActiveSkill==375){
			n_A_Weapon_zokusei = eval(document.calcForm.A_Weapon_zokusei.value);
			n_Delay[0] = 1;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 2;
			n_Delay[2] = 0.5;
			wbairitu = 0.4 + n_A_BaseLV / 100;
			if(Taijin==1)
				wbairitu = 0;
		}
		else if(n_A_ActiveSkill==407){
			n_A_Weapon_zokusei = 3;
			wbairitu = 0.9;
			wHITsuu = n_A_ActiveSkillLV;
			wCast = 0.7 * n_A_ActiveSkillLV;
		}
		else if(n_A_ActiveSkill==408){
			n_A_Weapon_zokusei = 3;
			wbairitu = 0.5;
			wHITsuu = Math.round(n_A_ActiveSkillLV / 2) +4 ;
			wCast = 6.5 - 0.5 * n_A_ActiveSkillLV;
			n_Delay[2] = 1;
			n_Delay[0] = 1;
		}
		else if(n_A_ActiveSkill==409){
			n_A_Weapon_zokusei = 3;
			wbairitu = 1.5 + n_A_ActiveSkillLV * 1.5;
			wHITsuu = 1;
			wCast = 3;
			n_Delay[2] = 3;
		}
		else if(n_A_ActiveSkill==410){
			n_A_Weapon_zokusei = 1;
			wbairitu = 1;
			wHITsuu = n_A_ActiveSkillLV + 2;
			wCast = n_A_ActiveSkillLV * 0.7;
		}
		else if(n_A_ActiveSkill==412){
			n_A_Weapon_zokusei = 1;
			wbairitu = 1.0 + n_A_ActiveSkillLV * 0.5;
			wHITsuu = 1;
			wCast = 3;
			n_Delay[2] = 3;
		}
		else if(n_A_ActiveSkill==413){
			n_A_Weapon_zokusei = 4;
			wbairitu = 1.0;
			wHITsuu = Math.floor(n_A_ActiveSkillLV / 2) +1;
			wCast = Math.floor(n_A_ActiveSkillLV / 2) + 1;
			n_Delay[2] = 1;
		}
		else if(n_A_ActiveSkill==414){
			n_A_Weapon_zokusei = 4;
			wbairitu = 1.6 + 0.4 * n_A_ActiveSkillLV;
			wHITsuu = 1;
			wCast = 4;
		}
		else if(n_A_ActiveSkill==415){
			n_A_Weapon_zokusei = 4;
			wbairitu = 1.0 + n_A_ActiveSkillLV * 1.0;
			wHITsuu = 1;
			wCast = 4;
		}

		wCast *= n_A_CAST;

		for(var b=0;b<=2;b++){
			w_DMG[b] = BattleMagicCalc(n_A_MATK[b] * wbairitu);
			myInnerHtml("ATK_0"+b,w_DMG[b] * wHITsuu + "("+w_DMG[b]+ SubName[8] +wHITsuu+"hit)",0);
			w_DMG[b] *= wHITsuu;
		}

		w_HIT_HYOUJI = 100;
		CastAndDelay();
		BattleCalc998();
	}
}


function ATKbai01()
{
	wA01 = 100;
	if(n_A_ActiveSkill != 193 &&n_A_ActiveSkill != 197 && n_A_ActiveSkill != 321){
		if(SkillSearch(12))
			wA01 += 32;
		else if(n_A_PassSkill6[5])
			wA01 += 2 + 3 * n_A_PassSkill6[5];
		else if(n_A_PassSkill2[12])
			wA01 += 5;
		if(SkillSearch(256))
			wA01 += SkillSearch(256) * 5;
		if(SkillSearch(270))
			wA01 += SkillSearch(270) * 2;
		if(n_A_PassSkill5[3])
			wA01 += 100;
		if(n_A_PassSkill6[2])
			wA01 += 10;
		if(StPlusCalc2(87))
			wA01 += StPlusCalc2(87);
	}
	n_A_CriATK[2] = n_A_CriATK[2] * wA01 /100;
	n_A_CriATK[0] = n_A_CriATK[0] * wA01 /100;
	n_A_CriATK[1] = n_A_CriATK[1] * wA01 /100;
	n_A_DMG[2] = n_A_DMG[2] * wA01 /100;
	n_A_DMG[0] = n_A_DMG[0] * wA01 /100;
	n_A_DMG[1] = n_A_DMG[1] * wA01 /100;
}


function ATKbai02(wATKbai,ch_A02)
{
	wA02 = wATKbai * 100;
	if(SkillSearch(327)){
		wA02 += 20 * SkillSearch(327);
	}
	else{
		if(SkillSearch(154))
			wA02 += SkillSearch(154) * 5;
		if(SkillSearch(154)==0 && n_A_PassSkill2[8])
			wA02 += n_A_PassSkill2[8] * 5 / 5;
	}
	if(SkillSearch(342)){
		wA02 += 2 * SkillSearch(342) * SkillSearch(380);
	}

	if(ch_A02 == 0){
		n_A_DMG[2] = Math.floor(n_A_DMG[2] * wA02 /100);
		n_A_DMG[0] = Math.floor(n_A_DMG[0] * wA02 /100);
		n_A_DMG[1] = Math.floor(n_A_DMG[1] * wA02 /100);
	}else{
		n_A_CriATK[1] = Math.floor(n_A_CriATK[1] * wA02 /100);
		n_A_CriATK[0] = Math.floor(n_A_CriATK[0] * wA02 /100);
		n_A_CriATK[2] = Math.floor(n_A_CriATK[2] * wA02 /100);
	}
}


function BattleTAKA()
{
	if(n_A_WeaponType==10 && SkillSearch(118) && n_A_ActiveSkill !=272){
		wBTw1 = Math.floor((n_A_JobLV -1) / 10 +1);
		if(wBTw1 > 5)wBTw1=5;
		wBTw2 = SkillSearch(118);
		if(wBTw2 < wBTw1)
			wBTw1 = wBTw2;
		wBT = 80 + Math.floor(n_A_DEX /10)*2 + Math.floor(n_A_INT/2)*2 + SkillSearch(119) *6;
		wBT = Math.floor(wBT * zokusei[n_B[3]][0]);
		wBT = tPlusDamCut(wBT);
		wBTw3 = Math.round((1 + n_A_LUK * 0.3)*100)/100;
		if(n_B[0] == 44)
			wBT = 0;
		str_bSUBname += "闪电冲击(发动率)<BR>";
		n_TAKA_DMG = wBT * wBTw1;
		str_bSUB += n_TAKA_DMG +"("+ wBTw3 +"％)<BR>";
		wBT = n_TAKA_DMG * wBTw3 /100;
		wBT = wBT * (w_HIT + ((100 - w_HIT) * w_Cri /100)) /100;
		wBTw1=0;
		return Math.round(wBT *100)/100;
	}else{
		n_TAKA_DMG = 0;
		return 0;
	}
}


function HealCalc(HealLv,HealType)
{
	wHeal = Math.floor((n_A_BaseLV + n_A_INT) /8) * (HealLv *8 +4);
	var wHealBAI = 100 + SkillSearch(269) *2;
	wHeal = Math.floor(wHeal * wHealBAI /100);

	var wX = 100 + n_tok[91];
	if(HealType == 1)
		wX += n_tok[92];
	if(EquipNumSearch(644))
		wX += Math.floor(n_A_Weapon_ATKplus * 1.5);
	if(EquipNumSearch(1034)&&n_A_HEAD_DEF_PLUS>=7)
		wX = Math.floor(wX+1);
	if(EquipNumSearch(1065))
		wX = Math.floor(wX+SkillSearch(23));
	wHeal = Math.floor(wHeal * wX /100);

	return wHeal;
}

function BattleCalc998()
{
	if(n_PerHIT_DMG > 0 && w_HIT_HYOUJI < 100){
		str_bSUBname += "<Font size=2>Miss时伤害</Font>";
		if(str_PerHIT_DMG == 0)
			str_bSUB += n_PerHIT_DMG;
		else
			str_bSUB += str_PerHIT_DMG;
	}

	myInnerHtml("bSUBname",str_bSUBname,0);
	myInnerHtml("bSUB",str_bSUB,0);
	myInnerHtml("BattleHIT",w_HIT_HYOUJI,0);

	if(n_B[0]==44 && n_A_ActiveSkill != 0 && n_A_ActiveSkill != 325){
		for(i=0;i<=2;i++){
			w_DMG[i] = 0;
			myInnerHtml("ATK_0"+i,0,0);
		}
	}

	tPlusAG();
	w = n_B[6];
	for(i=0;0<w && i<1000;i++){
		w -= w_DMG[2];
	}
	if(i<1000)
		myInnerHtml("MinATKnum",i,0);
	else
		myInnerHtml("MinATKnum",SubName[5],0);

	if(w_HIT_HYOUJI < 100 && n_PerHIT_DMG == 0){
		myInnerHtml("MaxATKnum","<Font size=2>无法计算</Font>",0);
	}else{
		w = n_B[6];
		var wX = w_DMG[0];
		if(w_HIT_HYOUJI < 100)
			wX = n_PerHIT_DMG;
		for(i=0;0<w && i<1000;i++){
			w -= wX;
		}
		if(i<1000)
			myInnerHtml("MaxATKnum",i,0);
		else
			myInnerHtml("MaxATKnum",SubName[5],0);
	}

	w = n_B[6];
	for(i=0;0<w && i<1000;i++){
		w -= w_DMG[1];
	}
	
	if(Taijin==0){
		if(i<1000){
			myInnerHtml("AtkBaseExp",Math.round(n_B[16] / i) +"Exp",0);
			myInnerHtml("AtkJobExp",Math.round(n_B[17] / i) +"Exp",0);
		}else{
			myInnerHtml("AtkBaseExp",SubName[7],0);
			myInnerHtml("AtkJobExp",SubName[7],0);
		}
	}
	if(i<1000)
	{
		myInnerHtml("AveATKnum",i,0);

		n_AveATKnum = i;

		
		var w = (wCast + wDelay) * n_AveATKnum;
		w = Math.floor(w * 100) / 100;

		if(n_Delay[0])
			myInnerHtml("BattleTime","特殊",0);
		else
			myInnerHtml("BattleTime",w + "秒",0);
	}
	else
	{
		myInnerHtml("AveATKnum",SubName[5],0);
		myInnerHtml("BattleTime",SubName[6],0);
	}
	
	var w = 1 / (wCast + wDelay) * w_DMG[1];
	w *= 100;
	w = Math.round(w);
	w /= 100;

	if(n_Delay[0])
		myInnerHtml("AveSecondATK","特殊",0);
	else
		myInnerHtml("AveSecondATK",w,0);

	if(Taijin==0){
		w = BattleHiDam();

		w = Math.round(w *(100-n_A_LUCKY))/100;
		w = Math.round(w *(100-w_FLEE))/100;
		if(SkillSearch(157)){
			w = Math.round(w * w_AG[SkillSearch(157)])/100;
		}
		if(n_A_WeaponType==3 && SkillSearch(255)){
			w = Math.round(w * (80- SkillSearch(255) *3))/100;
		}
		if(SkillSearch(287)){
			w = Math.round(w * (100- SkillSearch(287) *7.5))/100;
		}
		myInnerHtml("B_Ave2Atk",w+"伤害",0);
		
	}
}

function BattleHiDam(){
	
	w_HiDam = new Array();
	wBHD = n_B[13];
	w_HiDam[0] = n_B[12];
	w_HiDam[1] = (n_B[12] *5 + wBHD) /6;
	w_HiDam[2] = (n_B[12] *4 + wBHD *2) /6;
	w_HiDam[3] = (n_B[12] + wBHD) /2;
	w_HiDam[4] = (n_B[12] *2 + wBHD *4) /6;
	w_HiDam[5] = (n_B[12] + wBHD *5) /6;
	w_HiDam[6] = wBHD;
	if(n_B[12] == n_B[13])
		w_HiDam[6] = wBHD - 1;

	w_HiDam[0] = w_HiDam[0] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[2];
	w_HiDam[1] = w_HiDam[1] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[2];
	w_HiDam[2] = w_HiDam[2] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[2];
	w_HiDam[3] = w_HiDam[3] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[1];
	w_HiDam[4] = w_HiDam[4] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[0];
	w_HiDam[5] = w_HiDam[5] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[0];
	w_HiDam[6] = w_HiDam[6] * (100-n_A_totalDEF) / 100 - n_A_VITDEF[0];

	
	if(SkillSearch(23) && (n_B[3]>=90 || n_B[2]==6)){
		wBHD = Math.floor((3 + 4/100 * n_A_BaseLV) * SkillSearch(23));
		for(i=0;i<=6;i++)
			w_HiDam[i] -= wBHD;
	}

	
	if(SkillSearch(355)){
		wBHD = Math.floor((n_A_BaseLV + n_A_LUK + n_A_DEX) / 2);
		for(i=0;i<=6;i++)
			w_HiDam[i] -= wBHD;
	}

	
	if(EquipNumSearch(957)){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * 30 /100);
	}

	
	wBHD = n_tok[60];
	if(wBHD != 0){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}
	
	if(SkillSearch(58)){
		wBHD = 6 * SkillSearch(58);
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	
	wBHD = n_tok[50+n_B[2]];
	if(wBHD != 0){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	
	wBHD = n_tok[190+n_B[4]];
	if(wBHD != 0){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	
	if(n_B[19] == 0){
		wBHD = n_tok[79];
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	
	if(n_B[20]){
		wBHD = n_tok[78];
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
		
		if(SkillSearch(165)){
			wBHD = 5 + 15 * SkillSearch(165);
			for(i=0;i<=6;i++)
				w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
		}
	}

	
	if(n_B[19]==1){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * n_tok[77] /100);
		
	}

	
	wBHD = StPlusCard(3000+n_B[0]);
	wBHD += StPlusCalc2(3000+n_B[0]);
	for(i=0;i<=6;i++)
		w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);

	for(i=0;i<=6;i++){
		if(w_HiDam[i] < 1)
			w_HiDam[i]=1;

	}

	if(n_A_PassSkill2[5])
		for(i=0;i<=6;i++)
			w_HiDam[i] = Math.floor(w_HiDam[i] / 2);

	if(n_A_PassSkill5[5])
		for(i=0;i<=6;i++)
			w_HiDam[i] = Math.floor(w_HiDam[i] / 2);

	w_HiDam[0] = Math.floor(w_HiDam[0]);
	w_HiDam[6] = Math.floor(w_HiDam[6]);

	
	wBHD=0;
	for(i=0;i<=6;i++)
		wBHD += w_HiDam[i];
	wBHD = Math.round(wBHD / 7);
	myInnerHtml("B_AveAtk",wBHD +" ("+ w_HiDam[0] +"～"+ w_HiDam[6]+")",0);

	return wBHD;
}

function BattleMagicCalc(wBMC)
{
	wBMC_MDEF = n_B[15];
	var MDEF_Musi = 0;
	if(n_B[19]==0 && CardNumSearch(424))
		MDEF_Musi = 1;
	if(MDEF_Musi != 0){
		wBMC_MDEF = 0;
		n_B_MDEF2 = 0;
	}
	if(n_A_ActiveSkill==122)
		wBMC2 = Math.floor(wBMC + 50);
	else
		wBMC2 = Math.floor(wBMC * (100 - wBMC_MDEF) /100 - n_B_MDEF2);
	if(wBMC2 < 1)wBMC2=1;
	if(n_A_ActiveSkill==104){
		if(n_B[2] != 6 && n_B[3] < 90){
			wBMC2=0;
		}
	}

	wBMC2 = Math.floor(wBMC2 * zokusei[n_B[3]][n_A_Weapon_zokusei]);

	if(90 <= n_B[3] && n_A_ActiveSkill==47)
		wBMC2 = Math.floor(wBMC2 * (1 + 0.05 * n_A_ActiveSkillLV));

	
	var wX = n_tok[170+n_B[2]];
	if(n_B[2]==9  && SkillSearch(234))
		wX += SkillSearch(234) *2;
	wBMC2 = wBMC2 * (100 + wX) /100;

	wBMC2 = tPlusDamCut(wBMC2);

	
	var wX = StPlusCalc2(5000+n_A_ActiveSkill) + StPlusCard(5000+n_A_ActiveSkill);
	if(n_A_ActiveSkill==46 || n_A_ActiveSkill==47 || n_A_ActiveSkill==277)
		if(n_A_JobSearch()==5)
			wX += 20 * CardNumSearch(474);
	if(n_A_ActiveSkill==131)
		if(EquipNumSearch(1047))
			wX += n_A_Weapon_ATKplus;
	if(n_A_ActiveSkill==132||n_A_ActiveSkill==133)
   if(EquipNumSearch(1083))
	wX+=n_A_HEAD_DEF_PLUS+15;
	wBMC2 = wBMC2 * (100 + wX) / 100;

	wBMC2 = Math.floor(wBMC2);

	return wBMC2;
}

function ClickJob(n){
with(document.calcForm){
	
	myInnerHtml("A_KakutyouSel","",0);
	myInnerHtml("A_KakutyouData","",0);
	A_Kakutyou.value = 0;

	for(i=0;i<=12;i++)
		n_A_PassSkill2[i] = 0;
	if(n_SkillSW){
		A2_Skill0.value = 0;
		A2_Skill1.value = 0;
		A2_Skill2.value = 0;
		A2_Skill3.checked = 0;
		A2_Skill4.value = 0;
		A2_Skill5.checked = 0;
		A2_Skill6.checked = 0;
		A2_Skill7.checked = 0;
		A2_Skill8.value = 0;
		A2_Skill9.value = 0;
		A2_Skill10.value = 0;
		A2_Skill11.checked = 0;
	}

	n_A_JobSet();
	n = n_A_JOB;
	
	var len = A_JobLV.length;
	for(i=0;i<len;i++)
		A_JobLV.options[0] = null;
	w=0;
	if(n == 0)w=10;
	else if(n <= 19 || (41 <= n && n <= 43))w=50;
	else if(n == 20)w=71;
	else w=70;
	for(i=1;i<=w;i++)
		A_JobLV.options[i-1] = new Option(i,i);
	if(n==20){
		A_JobLV.options[69] = new Option("70-99",70);
		A_JobLV.options[70] = new Option("无死亡",71);
	}

	for(var i=2;i<=3;i++)
		A_SpeedPOT.options[2] = null;

	if(n_A_JOB != 3 && n_A_JobSearch2() != 9 && n_A_JobSearch2() != 16)
		A_SpeedPOT.options[2] = new Option(SpeedPotName[2]+"(Lv40)",2);
	else
		A_SpeedPOT.options[2] = new Option("-",0);
	if(n_A_JobSearch()==1 || n_A_JobSearch()==6 || n_A_JobSearch()==41 || n_A_JobSearch2()==14 || n_A_JobSearch2()==11 || n_A_JOB == 5 || n_A_JOB == 45)
		A_SpeedPOT.options[3] = new Option(SpeedPotName[3]+"(Lv85)",3);
	else if(n_A_JOB == 22)
		A_SpeedPOT.options[3] = new Option("■特殊("+ SkillOBJ[304][2] +"Lv85)/毒药瓶",3);
	else
		A_SpeedPOT.options[3] = new Option("■特殊("+ SkillOBJ[304][2] +")(Lv85)",3);


	if(n_A_JOB != 20)
		SuperNoviceFullWeaponCHECK = 0;
	if(SuperNoviceFullWeaponCHECK)
		JobASPD[20][7] = 120;
	else
		JobASPD[20][7] = 0;

	for(i=21;i>=0;i--)
		A_WeaponType.options[i] = null;
	j = 0;
	for (i=0; i<=21; i++)
	{
		if(JobASPD[n][i] != 0)
		{
			A_WeaponType.options[j] = new Option(WeaponName[i],i);
			j++;
		}
	}


	ClickWeaponType(0);

	
	for(i=0;i<=14;i++){
		if(JobSkillPassOBJ[n][i] != 999){
			myInnerHtml("P_Skill"+i,SkillOBJ[JobSkillPassOBJ[n][i]][2],0);
			myInnerHtml("P_Skill"+i+"s","<select name=A_skill"+i+" id=A_skill"+i+" onChange=StAllCalc()></select>",0);
		}
		else{
			myInnerHtml("P_Skill"+i,"",0);
			myInnerHtml("P_Skill"+i+"s","",0);
		}
	}

	
	for(var j=0;j<=14;j++){
		if(JobSkillPassOBJ[n][j] != 999){
			var wOBJ = document.getElementById("A_skill"+j);
			for(var i=10;i>=0;i--)
				wOBJ.options[i] = null;
			for(var i=0;i<=SkillOBJ[JobSkillPassOBJ[n][j]][1];i++)
				wOBJ.options[i] = new Option(i,i);
		}
	}
	
	if(JobSkillPassOBJ[n][0]==58){
		for(i=10;i>=0;i--)
			A_skill0.options[i] = null;
		n_ECname=["0","减少6%伤害","减少12%伤害","减少18%伤害","减少24%伤害","减少30%伤害"];
		for(i=0;i<=5;i++)
			A_skill0.options[i] = new Option(n_ECname[i],i);
	}
	
	if(JobSkillPassOBJ[n][5]==78){
		for(i=10;i>=0;i--)
			A_skill5.options[i] = null;
		n_ECname=["没骑鸟","修练0","修练1","修练2","修练3","修练4","修练5"];
		for(i=0;i<=6;i++)
			A_skill5.options[i] = new Option(n_ECname[i],i);
	}
	
	if(JobSkillPassOBJ[n][9]==78){
		for(i=10;i>=0;i--)
			A_skill9.options[i] = null;
		n_ECname=["没骑鸟","修练0","修练1","修练2","修练3","修练4","修练5"];
		for(i=0;i<=6;i++)
			A_skill9.options[i] = new Option(n_ECname[i],i);
	}



	
	var len = A_ActiveSkill.length;
	for(var i=0;i<len;i++)
		A_ActiveSkill.options[0] = null;
	for(i=0;JobSkillActiveOBJ[n][i] != 999;i++)
		A_ActiveSkill.options[i] = new Option(SkillOBJ[JobSkillActiveOBJ[n][i]][2],JobSkillActiveOBJ[n][i]);

	
	for(i=0;i<20;i++)
		w_ASSP0bk[i] = 999;
	ActiveSkillSetPlus();

	ClickActiveSkill(0);
	WeaponSet2();
}}

function ClickWeaponType(n){
with(document.calcForm){
	n_A_JobSet();
	if(n_A_JobSearch()==2 || n_A_JobSearch()==4 || (n_A_JOB==45 && n!=0)){
		A_Arrow.style.visibility = "visible";
		var len = A_Arrow.length;
		for(var i=0;i<len;i++)
			A_Arrow.options[0] = null;
		if(n==10||n==14||n==15){
			j=17;
			for (i=0; i<=4; i++)
				ArrowOBJ[i] = ArrowOBJbackup[i];
		}else if(n==17||n==18||n==19||n==20){
			j=2;
			for (i=0; i<=2; i++)
				ArrowOBJ[i] = BulletOBJ[i];
		}else if(n==21){
			j=4;
			for (i=0; i<=4; i++)
				ArrowOBJ[i] = GrenadeOBJ[i]
		}else{
			j=1;
			ArrowOBJ[0] = [0,0,"无箭矢"];
			ArrowOBJ[1] = ArrowOBJ[16];
		}
		for(i=0; i<=j; i++)
			A_Arrow.options[i] = new Option(ArrowOBJ[i][2],i);
	}else{
		A_Arrow.value = 0;
		A_Arrow.style.visibility = "hidden";
	}
	WeaponSet();

	
	if(n == 0){
		myInnerHtml("A_seirenchi_name","",0);
		A_Weapon_ATKplus.style.visibility = "hidden";
		A_Weapon_ATKplus.value = 0;
	}
	else{
		myInnerHtml("A_seirenchi_name","精练值",0);
		A_Weapon_ATKplus.style.visibility = "visible";
	}

	
	n_A_JobSet();
	if((n_A_JOB == 8 || n_A_JOB == 22) && n != 11){
		if(n_Nitou == 0)
			myInnerHtml("A_SobWeaponName","左手："+'<select name="A_Weapon2Type" onChange = "ClickWeaponType2(this[this.selectedIndex].value) | StAllCalc()">	<option value="0">空手or盾<option value="1">短剑<option value="2">单手剑<option value="6">单手斧</select>',0);
	}
	else{
		myInnerHtml("A_SobWeaponName","",0);
		myInnerHtml("spanA_weapon2","",0);
		myInnerHtml("spanA_weapon2seiren","",0);
		myInnerHtml("spanA_weapon2_CardShort","",0);
		myInnerHtml("nA_weapon2_c1","",0);
		myInnerHtml("nA_weapon2_c2","",0);
		myInnerHtml("nA_weapon2_c3","",0);
		myInnerHtml("nA_weapon2_c4","",0);
		n_Nitou = 0;
		A_LEFT_DEF_PLUS.style.visibility = "visible";
		A_left.style.visibility = "visible"
		A_left_card.style.visibility = "visible"
	}
	n_A_Equip[0] = eval(A_weapon1.value);
	ActiveSkillSetPlus();
}}


function ClickWeaponType2(n){
with(document.calcForm){
	
	n_A_JobSet();
	if(n != 0){
		if(n_Nitou == 0){
			myInnerHtml("spanA_weapon2",'左手：<select name="A_weapon2"onChange="StAllCalc()|ClickB_Item(this[this.selectedIndex].value)"></select>',0);
			myInnerHtml("spanA_weapon2seiren","精练值(左)"+'<select name="A_Weapon2_ATKplus"></select>',0);
			for(i=0;i<=10;i++){
				A_Weapon2_ATKplus.options[i] = new Option(i,i);
			}

			myInnerHtml("nA_weapon2_c1",'左手：<select name="A_weapon2_card1"onChange="StAllCalc()|Click_Card(this[this.selectedIndex].value)"></select>',0);
			myInnerHtml("nA_weapon2_c2",'<select name="A_weapon2_card2"onChange="StAllCalc()|Click_Card(this[this.selectedIndex].value)"></select>',0);
			myInnerHtml("nA_weapon2_c3",'<select name="A_weapon2_card3"onChange="StAllCalc()|Click_Card(this[this.selectedIndex].value)"></select>',0);
			myInnerHtml("nA_weapon2_c4",'<select name="A_weapon2_card4"onChange="StAllCalc()|Click_Card(this[this.selectedIndex].value)"></select>',0);

			for(i=0;CardSortOBJ[0][i]!="NULL";i++)
				A_weapon2_card1.options[i] = new Option(cardOBJ[CardSortOBJ[0][i]][2],cardOBJ[CardSortOBJ[0][i]][0]);
			for(i=0;CardSortOBJ[1][i]!="NULL";i++){
				A_weapon2_card2.options[i] = new Option(cardOBJ[CardSortOBJ[1][i]][2],cardOBJ[CardSortOBJ[1][i]][0]);
				A_weapon2_card3.options[i] = new Option(cardOBJ[CardSortOBJ[1][i]][2],cardOBJ[CardSortOBJ[1][i]][0]);
				A_weapon2_card4.options[i] = new Option(cardOBJ[CardSortOBJ[1][i]][2],cardOBJ[CardSortOBJ[1][i]][0]);
			}
			A_weapon2_card4.options[4] = new Option("铁匠名声TOP10",106);

			A_LEFT_DEF_PLUS.style.visibility = "hidden";
			A_LEFT_DEF_PLUS.value = 0;
			A_left.style.visibility = "hidden";
			A_left.value = 305;
			A_left_card.style.visibility = "hidden";
			A_left_card.value = 0;
		}
		myInnerHtml("spanA_weapon2_CardShort",'<select name="A_cardshortLeft" onChange="SetCardShortLeft()|StAllCalc()|ActiveSkillSetPlus()"></select>',0);
		A_cardshortLeft.options[0] = new Option("快速选择卡片",0);
		for(i=1;i<=38;i++)
			A_cardshortLeft.options[i] = new Option(CardShort[i][0],i);
		n_Nitou = 1;
		WeaponSetLeft();
	}
	else{
		myInnerHtml("spanA_weapon2","",0);
		myInnerHtml("spanA_weapon2seiren","",0);
		myInnerHtml("spanA_weapon2_CardShort","",0);
		myInnerHtml("nA_weapon2_c1","",0);
		myInnerHtml("nA_weapon2_c2","",0);
		myInnerHtml("nA_weapon2_c3","",0);
		myInnerHtml("nA_weapon2_c4","",0);
		n_Nitou = 0;

		A_LEFT_DEF_PLUS.style.visibility = "visible";
		A_left.style.visibility = "visible"
		A_left_card.style.visibility = "visible"
	}
	if(n_Nitou){
		n_A_Equip[1] = eval(A_weapon2.value);
		ActiveSkillSetPlus();
	}
}}

function ClickActiveSkill(wAS){
with(document.calcForm){
	n_A_ActiveSkill = eval(A_ActiveSkill.value);
	if(n_A_ActiveSkill > 100000){
		n_A_ActiveSkillLV = Math.floor(n_A_ActiveSkill % 100);
		n_A_ActiveSkill = Math.floor((n_A_ActiveSkill % 100000) /100);
	}else
		n_A_ActiveSkillLV = SkillOBJ[n_A_ActiveSkill][1];

	var len = A_ActiveSkillLV.length;
	for(i=0;i<len;i++)
		A_ActiveSkillLV.options[0] = null;
	if(n_A_ActiveSkill >= 0)
		for(i=1;i<=n_A_ActiveSkillLV;i++)
			A_ActiveSkillLV.options[i-1] = new Option(i,i);

	if(SkillOBJ[n_A_ActiveSkill][1] == 1)
		A_ActiveSkillLV.style.visibility = "hidden";
	else{
		A_ActiveSkillLV.style.visibility = "visible";
		A_ActiveSkillLV.value = n_A_ActiveSkillLV;
	}
	ClickActiveSkill2();
}}


function ClickActiveSkill2(){
with(document.calcForm){
	if(n_A_ActiveSkill == 66 || n_A_ActiveSkill == 326){
		myInnerHtml("AASkillName","手推车重量",0);
		myInnerHtml("AASkill",'<input type="text" name="SkillSubNum" value="8000" size=8>',0);
	}
	else if(n_A_ActiveSkill == 111 || n_A_ActiveSkill == 112 || n_A_ActiveSkill == 113 || n_A_ActiveSkill == 122){
		myInnerHtml("AASkillName","魔物数量：",0);
		myInnerHtml("AASkill",'<select name="SkillSubNum"onChange="calc()"></select>',0);
		for(i=1;i<=20;i++)
			SkillSubNum.options[i-1] = new Option(i,i);
		SkillSubNum.value=1;
	}
	else if(n_A_ActiveSkill == 131){
		myInnerHtml("AASkillName","HIT值：",0);
		myInnerHtml("AASkill",'<select name="SkillSubNum"onChange="calc()"></select>',0);
		for(i=1;i<=15;i++)
			SkillSubNum.options[i-1] = new Option(i,i);
		SkillSubNum.value=3;
	}
	else if(n_A_ActiveSkill==88){
		myInnerHtml("AASkillName","毒性反弹的LV：",0);
		myInnerHtml("AASkill",'<select name="SkillSubNum"onChange="calc()"></select>',0);
		for(i=0;i<=10;i++)
			SkillSubNum.options[i] = new Option(i,i);
		SkillSubNum.value=5;
		if(n_A_JobSearch2() == 14)
			SkillSubNum.value=0;
	}
	else if(n_A_ActiveSkill==197){
		myInnerHtml("AASkillName","剩余SP：",0);
		myInnerHtml("AASkill",'<input type="text" name="SkillSubNum" size=6>',0);
		SkillSubNum.value = n_A_MaxSP -1;
	}
	else if(n_A_ActiveSkill==394){
		myInnerHtml("AASkillName","",0);
		myInnerHtml("AASkill",'<select name="SkillSubNum"onChange="calc()"></select>',0);
		for(i=0;i<=4;i++)
			SkillSubNum.options[i] = new Option(SyurikenOBJ[i][2],i);
		SkillSubNum.value = 0;
	}
	else if(n_A_ActiveSkill==395){
		myInnerHtml("AASkillName","",0);
		myInnerHtml("AASkill",'<select name="SkillSubNum"onChange="calc()"></select>',0);
		for(i=0;i<=4;i++)
			SkillSubNum.options[i] = new Option(KunaiOBJ[i][2],i);
		SkillSubNum.value = 0;
	}
	else if(n_A_ActiveSkill==405){
		myInnerHtml("AASkillName","剩余HP：",0);
		myInnerHtml("AASkill",'<input type="text" name="SkillSubNum" size=6>',0);
		SkillSubNum.value = n_A_MaxHP -1;
	}
	else{
		myInnerHtml("AASkillName","",0);
		myInnerHtml("AASkill","",0);
	}
}}

function Click_SkillSW(){
with(document.calcForm){
	n_SkillSW = A2_SKILLSW.checked;

	if(n_SkillSW){
		name_CSSW_SKILL = ["天使之赐福","加速术","神威祈福","幸运之颂歌","天使之障壁","圣母之祈福","速度激发","无视体型攻击","凶砍","风之步","气弹(将军魔碑卡)","怒爆状态","挑衅","<Font size=2>牺牲祈福(无法Save)</Font>","<Font size=2>神祐之光(无法Save)</Font>","<Font size=2>演奏/舞蹈技能于下方</Font>"];
		html_CSSW_SKILL = new Array();
		for(i=0;i<=15;i++)
			myInnerHtml("AS"+i+"_1",name_CSSW_SKILL[i],0);

		html_CSSW_SKILL[0] = '<select name="A2_Skill0"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[1] = '<select name="A2_Skill1"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[2] = '<select name="A2_Skill2"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[3] = '<input type="checkbox" name="A2_Skill3"onClick="calc()">';
		html_CSSW_SKILL[4] = '<select name="A2_Skill4"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[5] = '<input type="checkbox" name="A2_Skill5"onClick="calc()">';
		html_CSSW_SKILL[6] = '<select name="A2_Skill6"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[7] = '<input type="checkbox" name="A2_Skill7"onClick="calc()">';
		html_CSSW_SKILL[8] = '<select name="A2_Skill8"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[9] = '<select name="A2_Skill9"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[10] = '<select name="A2_Skill10"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[11] = '<input type="checkbox" name="A2_Skill11"onClick="calc()">';
		html_CSSW_SKILL[12] = '<input type="checkbox" name="A2_Skill12"onClick="calc()">';
		html_CSSW_SKILL[13] = '<select name="A2_Skill13"onChange="StAllCalc()"></select>';
		html_CSSW_SKILL[14] = '<select name="A2_Skill14"onChange="StAllCalc()"></select>';
		for(i=0;i<=14;i++)
			myInnerHtml("AS"+i+"_2",html_CSSW_SKILL[i],0);


		for(i=0;i<=10;i++){
			A2_Skill0.options[i] = new Option(i,i);
			A2_Skill1.options[i] = new Option(i,i);
			A2_Skill4.options[i] = new Option(i,i);
			A2_Skill9.options[i] = new Option(i,i);
		}
		for(i=0;i<=5;i++){
			A2_Skill2.options[i] = new Option(i,i);
			A2_Skill8.options[i] = new Option(i,i);
			A2_Skill10.options[i] = new Option(i,i);
			A2_Skill14.options[i] = new Option(i,i);
		}
		if(n_A_JOB==15||n_A_JOB==29)
			myInnerHtml("AS10_1","-",0);
		for(i=0;i<=3;i++)
			A2_Skill13.options[i] = new Option(i,i);
		A2_Skill6.options[0] = new Option("OFF",0);
		A2_Skill6.options[1] = new Option("普通状态",1);
		A2_Skill6.options[2] = new Option("灵魂状态",2);
		A2_Skill6.options[3] = new Option("速度激发 5等级卷轴",3);

		A2_Skill0.value = n_A_PassSkill2[0];
		A2_Skill1.value = n_A_PassSkill2[1];
		A2_Skill2.value = n_A_PassSkill2[2];
		A2_Skill3.checked = n_A_PassSkill2[3];
		A2_Skill4.value = n_A_PassSkill2[4];
		A2_Skill5.checked = n_A_PassSkill2[5];
		A2_Skill6.value = n_A_PassSkill2[6];
		A2_Skill7.checked = n_A_PassSkill2[7];
		A2_Skill8.value = n_A_PassSkill2[8];
		A2_Skill9.value = n_A_PassSkill2[9];
		A2_Skill10.value = n_A_PassSkill2[10];
		A2_Skill11.checked = n_A_PassSkill2[11];
		A2_Skill12.checked = n_A_PassSkill2[12];
		A2_Skill13.value = n_A_PassSkill2[13];
		A2_Skill14.value = n_A_PassSkill2[14];
	}
	else{
		for(i=0;i<=14;i++){
			myInnerHtml("AS"+i+"_1","",0);
			myInnerHtml("AS"+i+"_2","",0);
		}
		myInnerHtml("AS15_1","",0);
	}
}}

SWs3sw = [0,0,0,0,0,0,0,0,0,0,0,0];

function Click_Skill3SW(){
with(document.calcForm){
	n_Skill3SW = A3_SKILLSW.checked;

	if(n_Skill3SW){
		name_CS3SW_SKILL = ["吹口哨","刺客的黄昏","布莱奇之诗","依登的苹果","哼唱之音(暂)","女神之吻","为您服务(暂)","不死神齐格弗里德","经验值倍增","战鼓震天","尼贝隆根之戒指"];
		html_CS3SW_SKILL = new Array();
		for(i=0;i<=10;i++)
			myInnerHtml("EN"+i+"_1",name_CS3SW_SKILL[i],0);

		html_CS3SW_SKILL[0] = '<select name="A3_Skill0_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[1] = '<select name="A3_Skill1_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[2] = '<select name="A3_Skill2_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[3] = '<select name="A3_Skill3_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[4] = '<select name="A3_Skill4_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[5] = '<select name="A3_Skill5_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[6] = '<select name="A3_Skill6_1"onChange="Skill3SW_2()|StAllCalc()"></select>';
		html_CS3SW_SKILL[7] = '<select name="A3_Skill7"onChange="StAllCalc()"></select>';
		html_CS3SW_SKILL[8] = '<select name="A3_Skill8"onChange="ClickB_Enemy()"></select>';
		html_CS3SW_SKILL[9] = '<select name="A3_Skill9"onChange="StAllCalc()"></select>';
		html_CS3SW_SKILL[10] = '<select name="A3_Skill10"onChange="StAllCalc()"></select>';
		for(i=0;i<=10;i++)
			myInnerHtml("EN"+i+"_2",html_CS3SW_SKILL[i],0);

		myInnerHtml("EN11_1",'<input type="checkbox" name="A3_Skill11"onClick="Skill3SW_2()|calc()">'+"傀儡师的把戏",0);

		for(i=0;i<=10;i++){
			A3_Skill0_1.options[i] = new Option(i,i);
			A3_Skill1_1.options[i] = new Option(i,i);
			A3_Skill2_1.options[i] = new Option(i,i);
			A3_Skill3_1.options[i] = new Option(i,i);
			A3_Skill4_1.options[i] = new Option(i,i);
			A3_Skill5_1.options[i] = new Option(i,i);
			A3_Skill6_1.options[i] = new Option(i,i);
		}
		for(i=0;i<=5;i++){
			A3_Skill7.options[i] = new Option(i,i);
			A3_Skill8.options[i] = new Option(i,i);
			A3_Skill9.options[i] = new Option(i,i);
			A3_Skill10.options[i] = new Option(i,i);
		}

		A3_Skill0_1.value = n_A_PassSkill3[0];
		A3_Skill1_1.value = n_A_PassSkill3[1];
		A3_Skill2_1.value = n_A_PassSkill3[2];
		A3_Skill3_1.value = n_A_PassSkill3[3];
		A3_Skill4_1.value = n_A_PassSkill3[4];
		A3_Skill5_1.value = n_A_PassSkill3[5];
		A3_Skill6_1.value = n_A_PassSkill3[6];
		A3_Skill7.value = n_A_PassSkill3[7];
		A3_Skill8.value = n_A_PassSkill3[8];
		A3_Skill9.value = n_A_PassSkill3[9];
		A3_Skill10.value = n_A_PassSkill3[10];
		A3_Skill11.checked = n_A_PassSkill3[11];

		Skill3SW_2();
	}
	else{
		for(i=1;i<=6;i++){
			myInnerHtml("EN0_"+i,"",0);
			myInnerHtml("EN1_"+i,"",0);
			myInnerHtml("EN3_"+i,"",0);
			myInnerHtml("EN4_"+i,"",0);
			myInnerHtml("EN5_"+i,"",0);
			myInnerHtml("EN6_"+i,"",0);
		}
		for(i=1;i<=8;i++)
			myInnerHtml("EN2_"+i,"",0);
		for(i=1;i<=2;i++){
			myInnerHtml("EN7_"+i,"",0);
			myInnerHtml("EN8_"+i,"",0);
			myInnerHtml("EN9_"+i,"",0);
			myInnerHtml("EN10_"+i,"",0);
			myInnerHtml("EN11_"+i,"",0);
		}

		for(i=0;i<=11;i++)
			SWs3sw[i]=0;
	}
}}

function Skill3SW_2(){
with(document.calcForm){
	n_A_PassSkill3[0] = eval(A3_Skill0_1.value);
	n_A_PassSkill3[1] = eval(A3_Skill1_1.value);
	n_A_PassSkill3[2] = eval(A3_Skill2_1.value);
	n_A_PassSkill3[3] = eval(A3_Skill3_1.value);
	n_A_PassSkill3[4] = eval(A3_Skill4_1.value);
	n_A_PassSkill3[5] = eval(A3_Skill5_1.value);
	n_A_PassSkill3[6] = eval(A3_Skill6_1.value);
	n_A_PassSkill3[11] = eval(A3_Skill11.checked);

	if(n_A_PassSkill3[0] != 0){
		if(SWs3sw[0] == 0){
			if(n_A_PassSkill3[20] == 0){
				n_A_PassSkill3[20] = 100;
				n_A_PassSkill3[30] = 10;
			}
			myInnerHtml("EN0_3","诗人的AGI",0);
			myInnerHtml("EN0_4",'<select name="A3_Skill0_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN0_5","操控乐器",0);
			myInnerHtml("EN0_6",'<select name="A3_Skill0_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=150;i++)
				A3_Skill0_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill0_3.options[i-1] = new Option(i,i);
			SWs3sw[0] = 1;
			A3_Skill0_2.value = n_A_PassSkill3[20];
			A3_Skill0_3.value = n_A_PassSkill3[30];
		}
	}else{
		SWs3sw[0] = 0;
		myInnerHtml("EN0_3","-",0);
		myInnerHtml("EN0_4","-",0);
		myInnerHtml("EN0_5","",0);
		myInnerHtml("EN0_6","",0);
	}

	if(n_A_PassSkill3[1] != 0){
		if(SWs3sw[1] == 0){
			if(n_A_PassSkill3[21]==0){
				n_A_PassSkill3[21] = 100;
				n_A_PassSkill3[31] = 10;
			}
			myInnerHtml("EN1_3","诗人的AGI",0);
			myInnerHtml("EN1_4",'<select name="A3_Skill1_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN1_5","操控乐器",0);
			myInnerHtml("EN1_6",'<select name="A3_Skill1_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=150;i++)
				A3_Skill1_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill1_3.options[i-1] = new Option(i,i);
			SWs3sw[1] = 1;
			A3_Skill1_2.value = n_A_PassSkill3[21];
			A3_Skill1_3.value = n_A_PassSkill3[31];
		}
	}else{
		SWs3sw[1] = 0;
		myInnerHtml("EN1_3","-",0);
		myInnerHtml("EN1_4","-",0);
		myInnerHtml("EN1_5","",0);
		myInnerHtml("EN1_6","",0);
	}

	if(n_A_PassSkill3[2] != 0){
		if(SWs3sw[2] == 0){
			if(n_A_PassSkill3[22]==0){
				n_A_PassSkill3[22] = 130;
				n_A_PassSkill3[29] = 80;
				n_A_PassSkill3[32] = 10;
			}
			myInnerHtml("EN2_3","诗人的DEX",0);
			myInnerHtml("EN2_4",'<select name="A3_Skill2_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN2_5","诗人的INT",0);
			myInnerHtml("EN2_6",'<select name="A3_Skill2_3"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN2_7","操控乐器",0);
			myInnerHtml("EN2_8",'<select name="A3_Skill2_4"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=200;i++)
				A3_Skill2_2.options[i-1] = new Option(i,i);
			for(i=1;i<=150;i++)
				A3_Skill2_3.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill2_4.options[i-1] = new Option(i,i);
			SWs3sw[2] = 1;
			A3_Skill2_2.value = n_A_PassSkill3[22];
			A3_Skill2_3.value = n_A_PassSkill3[29];
			A3_Skill2_4.value = n_A_PassSkill3[32];
		}
	}else{
		SWs3sw[2] = 0;
		myInnerHtml("EN2_3","-",0);
		myInnerHtml("EN2_4","-",0);
		myInnerHtml("EN2_5","",0);
		myInnerHtml("EN2_6","",0);
		myInnerHtml("EN2_7","",0);
		myInnerHtml("EN2_8","",0);
	}

	if(n_A_PassSkill3[3] != 0){
		if(SWs3sw[3] == 0){
			if(n_A_PassSkill3[23]==0){
				n_A_PassSkill3[23] = 100;
				n_A_PassSkill3[33] = 10;
			}
			myInnerHtml("EN3_3","诗人的VIT",0);
			myInnerHtml("EN3_4",'<select name="A3_Skill3_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN3_5","操控乐器",0);
			myInnerHtml("EN3_6",'<select name="A3_Skill3_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=150;i++)
				A3_Skill3_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill3_3.options[i-1] = new Option(i,i);
			SWs3sw[3] = 1;
			A3_Skill3_2.value = n_A_PassSkill3[23];
			A3_Skill3_3.value = n_A_PassSkill3[33];
		}
	}else{
		SWs3sw[3] = 0;
		myInnerHtml("EN3_3","-",0);
		myInnerHtml("EN3_4","-",0);
		myInnerHtml("EN3_5","",0);
		myInnerHtml("EN3_6","",0);
	}

	if(n_A_PassSkill3[4] != 0){
		if(SWs3sw[4] == 0){
			if(n_A_PassSkill3[24]==0){
				n_A_PassSkill3[24] = 130;
				n_A_PassSkill3[34] = 10;
			}
			myInnerHtml("EN4_3","舞娘的DEX",0);
			myInnerHtml("EN4_4",'<select name="A3_Skill4_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN4_5","练习舞蹈",0);
			myInnerHtml("EN4_6",'<select name="A3_Skill4_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=180;i++)
				A3_Skill4_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill4_3.options[i-1] = new Option(i,i);
			SWs3sw[4] = 1;
			A3_Skill4_2.value = n_A_PassSkill3[24];
			A3_Skill4_3.value = n_A_PassSkill3[34];
		}
	}else{
		SWs3sw[4] = 0;
		myInnerHtml("EN4_3","-",0);
		myInnerHtml("EN4_4","-",0);
		myInnerHtml("EN4_5","",0);
		myInnerHtml("EN4_6","",0);
	}

	if(n_A_PassSkill3[5] != 0){
		if(SWs3sw[5] == 0){
			if(n_A_PassSkill3[25]==0){
				n_A_PassSkill3[25] = 50;
				n_A_PassSkill3[35] = 10;
			}
			myInnerHtml("EN5_3","舞娘的LUK",0);
			myInnerHtml("EN5_4",'<select name="A3_Skill5_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN5_5","练习舞蹈",0);
			myInnerHtml("EN5_6",'<select name="A3_Skill5_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=180;i++)
				A3_Skill5_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill5_3.options[i-1] = new Option(i,i);
			SWs3sw[5] = 1;
			A3_Skill5_2.value = n_A_PassSkill3[25];
			A3_Skill5_3.value = n_A_PassSkill3[35];
		}
	}else{
		SWs3sw[5] = 0;
		myInnerHtml("EN5_3","-",0);
		myInnerHtml("EN5_4","-",0);
		myInnerHtml("EN5_5","",0);
		myInnerHtml("EN5_6","",0);
	}

	if(n_A_PassSkill3[6] != 0){
		if(SWs3sw[6] == 0){
			if(n_A_PassSkill3[26]==0){
				n_A_PassSkill3[26] = 50;
				n_A_PassSkill3[36] = 10;
			}
			myInnerHtml("EN6_3","舞娘的INT",0);
			myInnerHtml("EN6_4",'<select name="A3_Skill6_2"onChange="StAllCalc()"></select>',0);
			myInnerHtml("EN6_5","练习舞蹈",0);
			myInnerHtml("EN6_6",'<select name="A3_Skill6_3"onChange="StAllCalc()"></select>',0);
			for(i=1;i<=180;i++)
				A3_Skill6_2.options[i-1] = new Option(i,i);
			for(i=1;i<=10;i++)
				A3_Skill6_3.options[i-1] = new Option(i,i);
			SWs3sw[6] = 1;
			A3_Skill6_2.value = n_A_PassSkill3[26];
			A3_Skill6_3.value = n_A_PassSkill3[36];
		}
	}else{
		SWs3sw[6] = 0;
		myInnerHtml("EN6_3","-",0);
		myInnerHtml("EN6_4","-",0);
		myInnerHtml("EN6_5","",0);
		myInnerHtml("EN6_6","",0);
	}

	if(n_A_PassSkill3[11] != 0){
		if(SWs3sw[11] == 0){
			myInnerHtml("EN11_2",
			"<br>施术者的素质："+
			'<select name="A3_Skill11_STR"onChange="StAllCalc()"></select>'+
			'<select name="A3_Skill11_AGI"onChange="StAllCalc()"></select>'+
			'<select name="A3_Skill11_VIT"onChange="StAllCalc()"></select>'+
			'<select name="A3_Skill11_INT"onChange="StAllCalc()"></select>'+
			'<select name="A3_Skill11_DEX"onChange="StAllCalc()"></select>'+
			'<select name="A3_Skill11_LUK"onChange="StAllCalc()"></select>'+
			"<BR>"+'<input type="checkbox" name="A3_Skill11a"onClick="calc()">'+"<Font size=2>将所选的属性点不减半直接加在基本能力值上</Font>",0);
			A3_Skill11_STR.options[0] = new Option("STR",0);
			A3_Skill11_AGI.options[0] = new Option("AGI",0);
			A3_Skill11_VIT.options[0] = new Option("VIT",0);
			A3_Skill11_INT.options[0] = new Option("INT",0);
			A3_Skill11_DEX.options[0] = new Option("DEX",0);
			A3_Skill11_LUK.options[0] = new Option("LUK",0);
			for(i=1;i<=99;i++){
				A3_Skill11_STR.options[i] = new Option(i,i);
				A3_Skill11_AGI.options[i] = new Option(i,i);
				A3_Skill11_VIT.options[i] = new Option(i,i);
				A3_Skill11_INT.options[i] = new Option(i,i);
				A3_Skill11_DEX.options[i] = new Option(i,i);
				A3_Skill11_LUK.options[i] = new Option(i,i);
			}
			SWs3sw[11] = 1;
			A3_Skill11_STR.value = n_A_PassSkill3[12];
			A3_Skill11_AGI.value = n_A_PassSkill3[13];
			A3_Skill11_VIT.value = n_A_PassSkill3[14];
			A3_Skill11_INT.value = n_A_PassSkill3[15];
			A3_Skill11_DEX.value = n_A_PassSkill3[16];
			A3_Skill11_LUK.value = n_A_PassSkill3[17];
			A3_Skill11a.checked = n_A_PassSkill3[18];
		}
	}else{
		SWs3sw[11] = 0;
		myInnerHtml("EN11_2","",0);
	}
}}

function Click_Skill4SW(){
with(document.calcForm){
	n_Skill4SW = A4_SKILLSW.checked;

	if(n_Skill4SW){
		name_CS4SW_SKILL = ["下达战斗命令","伟大的指导力","光荣的伤口","冷漠之心","尖锐的视线"];
		html_CS4SW_SKILL = new Array();
		for(i=0;i<=4;i++)
			myInnerHtml("EN4"+i+"_1",name_CS4SW_SKILL[i],0);
		html_CS4SW_SKILL[0] = '<input type="checkbox" name="A3_Skill40"onClick="calc()">';
		html_CS4SW_SKILL[1] = '<select name="A3_Skill41"onChange="StAllCalc()"></select>';
		html_CS4SW_SKILL[2] = '<select name="A3_Skill42"onChange="StAllCalc()"></select>';
		html_CS4SW_SKILL[3] = '<select name="A3_Skill43"onChange="StAllCalc()"></select>';
		html_CS4SW_SKILL[4] = '<select name="A3_Skill44"onChange="StAllCalc()"></select>';
		for(i=0;i<=4;i++)
			myInnerHtml("EN4"+i+"_2",html_CS4SW_SKILL[i],0);

		for(i=0;i<=5;i++){
			A3_Skill41.options[i] = new Option(i,i);
			A3_Skill42.options[i] = new Option(i,i);
			A3_Skill43.options[i] = new Option(i,i);
			A3_Skill44.options[i] = new Option(i,i);
		}
		A3_Skill40.checked = n_A_PassSkill3[40];
		A3_Skill41.value = n_A_PassSkill3[41];
		A3_Skill42.value = n_A_PassSkill3[42];
		A3_Skill43.value = n_A_PassSkill3[43];
		A3_Skill44.value = n_A_PassSkill3[44];
	}
	else{
		for(i=0;i<=4;i++)
			myInnerHtml("EN4"+i+"_1","",0);
		for(i=0;i<=4;i++)
			myInnerHtml("EN4"+i+"_2","",0);
	}
}}

function Click_Skill5SW(){
with(document.calcForm){
	n_Skill5SW = A5_SKILLSW.checked;

	if(n_Skill5SW){
		name_CS5SW_SKILL = ["全素质ALL+20","HP+100%","SP+100%","ATK+100%","HIT+50＆FLEE+50","伤害减半"];
		html_CS5SW_SKILL = new Array();
		for(i=0;i<=5;i++)
			myInnerHtml("EN5"+i+"_1",name_CS5SW_SKILL[i],0);
		html_CS5SW_SKILL[0] = '<input type="checkbox" name="A5_Skill0"onClick="calc()">';
		html_CS5SW_SKILL[1] = '<input type="checkbox" name="A5_Skill1"onClick="calc()">';
		html_CS5SW_SKILL[2] = '<input type="checkbox" name="A5_Skill2"onClick="calc()">';
		html_CS5SW_SKILL[3] = '<input type="checkbox" name="A5_Skill3"onClick="calc()">';
		html_CS5SW_SKILL[4] = '<input type="checkbox" name="A5_Skill4"onClick="calc()">';
		html_CS5SW_SKILL[5] = '<input type="checkbox" name="A5_Skill5"onClick="calc()">';
		for(i=0;i<=5;i++)
			myInnerHtml("EN5"+i+"_2",html_CS5SW_SKILL[i],0);

		A5_Skill0.checked = n_A_PassSkill5[0];
		A5_Skill1.checked = n_A_PassSkill5[1];
		A5_Skill2.checked = n_A_PassSkill5[2];
		A5_Skill3.checked = n_A_PassSkill5[3];
		A5_Skill4.checked = n_A_PassSkill5[4];
		A5_Skill5.checked = n_A_PassSkill5[5];
	}
	else{
		for(i=0;i<=5;i++)
			myInnerHtml("EN5"+i+"_1","",0);
		for(i=0;i<=5;i++)
			myInnerHtml("EN5"+i+"_2","",0);
	}
}}

function Click_Skill6SW(){
with(document.calcForm){
	n_Skill6SW = A6_SKILLSW.checked;

	if(n_Skill6SW){
		myInnerHtml("EN60_1",'<select name="A6_Skill0"onChange="StAllCalc()"></select>',0);
		myInnerHtml("EN60_2",'<select name="A6_Skill1"onChange="StAllCalc()"></select>',0);

		A6_Skill0.options[0] = new Option("火元素领域",0);
		A6_Skill0.options[1] = new Option("水元素领域",1);
		A6_Skill0.options[2] = new Option("风元素领域",2);
		for(i=0;i<=5;i++)
			A6_Skill1.options[i] = new Option(i,i);

		myInnerHtml("EN61_1","虐杀者系统",0);
		myInnerHtml("EN61_2",'<select name="A6_Skill2"onChange="StAllCalc()"></select>',0);
		A6_Skill2.options[0] = new Option("无",0);
		A6_Skill2.options[1] = new Option("ALL+3",1);
		A6_Skill2.options[2] = new Option("ALL+5",2);

		myInnerHtml("EN62_1","虎蜥人卡片(心神1)",0);
		myInnerHtml("EN62_2",'<select name="A6_Skill3"onChange="StAllCalc()"></select>',0);
		for(i=0;i<=2;i++)
			A6_Skill3.options[i] = new Option(i,i);

		myInnerHtml("EN63_1","领域支援",0);
		myInnerHtml("EN63_2",'<select name="A6_Skill4"onChange="StAllCalc()"></select>',0);
		for(i=0;i<=5;i++)
			A6_Skill4.options[i] = new Option(i,i);

		myInnerHtml("EN64_1","挑衅支援",0);
		myInnerHtml("EN64_2",'<select name="A6_Skill5"onChange="StAllCalc()"></select>',0);
		for(i=0;i<=10;i++)
			A6_Skill5.options[i] = new Option(i,i);

		myInnerHtml("EN65_1","圣体降福",0);
		myInnerHtml("EN65_2",'<input type="checkbox" name="A6_Skill6"onClick="calc()">',0);;

		A6_Skill0.value = n_A_PassSkill6[0];
		A6_Skill1.value = n_A_PassSkill6[1];
		A6_Skill2.value = n_A_PassSkill6[2];
		A6_Skill3.value = n_A_PassSkill6[3];
		A6_Skill4.value = n_A_PassSkill6[4];
		A6_Skill5.value = n_A_PassSkill6[5];
		A6_Skill6.checked = n_A_PassSkill6[6];
	}
	else{
		for(i=0;i<=5;i++){
			myInnerHtml("EN6"+i+"_1","",0);
			myInnerHtml("EN6"+i+"_2","",0);
		}
	}
}}

function Click_Skill7SW(){
with(document.calcForm){
	n_Skill7SW = A7_SKILLSW.checked;

	if(n_Skill7SW){
		myInnerHtml("EN70_1","茶食(HIT+30)",0);
		myInnerHtml("EN70_2",'<input type="checkbox" name="A7_Skill0"onClick="calc()">',0);

		myInnerHtml("EN71_1","油果(FLEE+30)",0);
		myInnerHtml("EN71_2",'<input type="checkbox" name="A7_Skill1"onClick="calc()">',0);

		myInnerHtml("EN72_1","彩色糕饼(ATK/MATK+10)",0);
		myInnerHtml("EN72_2",'<input type="checkbox" name="A7_Skill2"onClick="calc()">',0);

		myInnerHtml("EN79_1","怨恨的箱子(ATK+20)",0);
		myInnerHtml("EN79_2",'<input type="checkbox" name="A7_Skill9"onClick="calc()">',0);

		myInnerHtml("EN710_1","睡眠的箱子(MATK+20)",0);
		myInnerHtml("EN710_2",'<input type="checkbox" name="A7_Skill10"onClick="calc()">',0);

		myInnerHtml("EN711_1","水属性魔法抗药",0);
		myInnerHtml("EN711_2",'<input type="checkbox" name="A7_Skill11"onClick="calc()">',0);
		myInnerHtml("EN712_1","地属性魔法抗药",0);
		myInnerHtml("EN712_2",'<input type="checkbox" name="A7_Skill12"onClick="calc()">',0);
		myInnerHtml("EN713_1","火属性魔法抗药",0);
		myInnerHtml("EN713_2",'<input type="checkbox" name="A7_Skill13"onClick="calc()">',0);
		myInnerHtml("EN714_1","风属性魔法抗药",0);
		myInnerHtml("EN714_2",'<input type="checkbox" name="A7_Skill14"onClick="calc()">',0);
		myInnerHtml("EN715","在攻击方式栏里追加魔法攻击卷轴（例如：圣灵召唤_等级5 等等）和天地树叶子的效果。<input type='checkbox' name='A7_Skill15'onClick='calc()|ActiveSkillSetPlus()'>",0);

		myInnerHtml("EN73",'<select name="A7_Skill3"onChange="StAllCalc()"></select> ',0);
		myInnerHtml("EN74",'<select name="A7_Skill4"onChange="StAllCalc()"></select> ',0);
		myInnerHtml("EN75",'<select name="A7_Skill5"onChange="StAllCalc()"></select> ',0);
		myInnerHtml("EN76",'<select name="A7_Skill6"onChange="StAllCalc()"></select> ',0);
		myInnerHtml("EN77",'<select name="A7_Skill7"onChange="StAllCalc()"></select> ',0);
		myInnerHtml("EN78",'<select name="A7_Skill8"onChange="StAllCalc()"></select> ',0);

		A7_Skill3.options[0] = new Option("STR+料理",0);
		A7_Skill4.options[0] = new Option("AGI+料理",0);
		A7_Skill5.options[0] = new Option("VIT+料理",0);
		A7_Skill6.options[0] = new Option("INT+料理",0);
		A7_Skill7.options[0] = new Option("DEX+料理",0);
		A7_Skill8.options[0] = new Option("LUK+料理",0);

		for(i=1;i<=99;i++){
			A7_Skill3.options[i] = new Option("+"+i,i);
			A7_Skill4.options[i] = new Option("+"+i,i);
			A7_Skill5.options[i] = new Option("+"+i,i);
			A7_Skill6.options[i] = new Option("+"+i,i);
			A7_Skill7.options[i] = new Option("+"+i,i);
			A7_Skill8.options[i] = new Option("+"+i,i);
		}

		A7_Skill0.checked = n_A_PassSkill7[0];
		A7_Skill1.checked = n_A_PassSkill7[1];
		A7_Skill2.checked = n_A_PassSkill7[2];
		A7_Skill3.value = n_A_PassSkill7[3];
		A7_Skill4.value = n_A_PassSkill7[4];
		A7_Skill5.value = n_A_PassSkill7[5];
		A7_Skill6.value = n_A_PassSkill7[6];
		A7_Skill7.value = n_A_PassSkill7[7];
		A7_Skill8.value = n_A_PassSkill7[8];
		A7_Skill9.checked = n_A_PassSkill7[9];
		A7_Skill10.checked = n_A_PassSkill7[10];
		A7_Skill11.checked = n_A_PassSkill7[11];
		A7_Skill12.checked = n_A_PassSkill7[12];
		A7_Skill13.checked = n_A_PassSkill7[13];
		A7_Skill14.checked = n_A_PassSkill7[14];
		A7_Skill15.checked = n_A_PassSkill7[15];
	}
	else{
		myInnerHtml("EN70_1","",0);
		myInnerHtml("EN70_2","",0);
		myInnerHtml("EN71_1","",0);
		myInnerHtml("EN71_2","",0);
		myInnerHtml("EN72_1","",0);
		myInnerHtml("EN72_2","",0);
		for(i=73;i<=78;i++)
			myInnerHtml("EN"+i,"",0);
		for(i=9;i<=14;i++){
			myInnerHtml("EN7"+ i +"_1","",0);
			myInnerHtml("EN7"+ i +"_2","",0);
		}
		myInnerHtml("EN715","",0);
	}
}}

function Click_IjyouSW(){
with(document.calcForm){
	n_IjyouSW = B_IJYOUSW.checked;
	if(n_IjyouSW){
		var name_SKILL = ["挑衅(不死系不可)","泥沼术","中毒","黑暗","冰冻(不死系不可)","天使之赐福(不死/恶魔)","天使之怒","晕眩","睡眠","石化","诅咒","缓速术","天使之光","卸除武器","卸除盾牌","卸除铠甲","卸除头盔","易燃之网","精神憾动","勿忘我(未实装)","永远的浑沌","爆气状态(ATK3倍DEX3倍)","AGI3倍(BOSS用)","艾斯卡(DEF MDEF提升)","艾斯克(攻击力4倍防御1/2)","属性变化","元素更换","投掷硬币"];
		var html_SKILL = new Array();
		for(i=0;i<=20;i++)
			myInnerHtml("BI"+i+"_1",name_SKILL[i],0);
		if(Taijin==0){
			for(i=21;i<=23;i++)
				myInnerHtml("BI"+i+"_1",name_SKILL[i],0);
		}
		myInnerHtml("BI24_1",name_SKILL[24],0);

		html_SKILL[0] = '<select name="B_IJYOU0"onChange="calc()"></select>';
		html_SKILL[1] = '<select name="B_IJYOU1"onChange="calc()"></select>';
		html_SKILL[2] = '<input type="checkbox" name="B_IJYOU2"onClick="calc()">';
		html_SKILL[3] = '<input type="checkbox" name="B_IJYOU3"onClick="calc()">';
		html_SKILL[4] = '<input type="checkbox" name="B_IJYOU4"onClick="calc()">';
		html_SKILL[5] = '<input type="checkbox" name="B_IJYOU5"onClick="calc()">';
		html_SKILL[6] = '<input type="checkbox" name="B_IJYOU6"onClick="calc()">';
		html_SKILL[7] = '<input type="checkbox" name="B_IJYOU7"onClick="calc()">';
		html_SKILL[8] = '<input type="checkbox" name="B_IJYOU8"onClick="calc()">';
		html_SKILL[9] = '<input type="checkbox" name="B_IJYOU9"onClick="calc()">';
		html_SKILL[10] = '<input type="checkbox" name="B_IJYOU10"onClick="calc()">';
		html_SKILL[11] = '<select name="B_IJYOU11"onChange="calc()"></select>';
		html_SKILL[12] = '<select name="B_IJYOU12"onChange="calc()"></select>';
		html_SKILL[13] = '<input type="checkbox" name="B_IJYOU13"onClick="calc()">';
		html_SKILL[14] = '<input type="checkbox" name="B_IJYOU14"onClick="calc()">';
		html_SKILL[15] = '<input type="checkbox" name="B_IJYOU15"onClick="calc()">';
		html_SKILL[16] = '<input type="checkbox" name="B_IJYOU16"onClick="calc()">';
		html_SKILL[17] = '<input type="checkbox" name="B_IJYOU17"onClick="calc()">';
		html_SKILL[18] = '<select name="B_IJYOU18"onChange="calc()"></select>';
		html_SKILL[19] = '<input type="checkbox" name="B_IJYOU19"onClick="calc()">';
		html_SKILL[20] = '<input type="checkbox" name="B_IJYOU20"onClick="calc()">';
		html_SKILL[24] = '<select name="B_IJYOU24"onChange="calc()"></select>';
		for(i=0;i<=20;i++)
			myInnerHtml("BI"+i+"_2",html_SKILL[i],0);
		myInnerHtml("BI24_2",html_SKILL[24],0);

		for(i=0;i<=10;i++){
			B_IJYOU0.options[i] = new Option(i,i);
			B_IJYOU11.options[i] = new Option(i,i);
			B_IJYOU12.options[i] = new Option(i,i);
		}
		for(i=0;i<=5;i++){
			B_IJYOU1.options[i] = new Option(i,i);
			B_IJYOU18.options[i] = new Option(i,i);
			B_IJYOU24.options[i] = new Option(i,i);
		}
		if(Taijin==0){
			myInnerHtml("BI21_2",'<input type="checkbox" name="B_IJYOU21"onClick="calc()">',0);
			myInnerHtml("BI22_2",'<input type="checkbox" name="B_IJYOU22"onClick="calc()">',0);
			var ZoHe2 =["无","水","地","火","风"];
			myInnerHtml("BI23_2",'<select name="B_IJYOU23"onChange="calc()"></select>',0);
			for(i=0;i<=4;i++)
				B_IJYOU23.options[i] = new Option(ZoHe2[i],i);
		}
		B_IJYOU0.value = n_B_IJYOU[0];
		B_IJYOU1.value = n_B_IJYOU[1];
		B_IJYOU2.checked = n_B_IJYOU[2];
		B_IJYOU3.checked = n_B_IJYOU[3];
		B_IJYOU4.checked = n_B_IJYOU[4];
		B_IJYOU5.checked = n_B_IJYOU[5];
		B_IJYOU6.checked = n_B_IJYOU[6];
		B_IJYOU7.checked = n_B_IJYOU[7];
		B_IJYOU8.checked = n_B_IJYOU[8];
		B_IJYOU9.checked = n_B_IJYOU[9];
		B_IJYOU10.checked = n_B_IJYOU[10];
		B_IJYOU11.value = n_B_IJYOU[11];
		B_IJYOU12.value = n_B_IJYOU[12];
		B_IJYOU13.checked = n_B_IJYOU[13];
		B_IJYOU14.checked = n_B_IJYOU[14];
		B_IJYOU15.checked = n_B_IJYOU[15];
		B_IJYOU16.checked = n_B_IJYOU[16];
		B_IJYOU17.checked = n_B_IJYOU[17];
		B_IJYOU18.value = n_B_IJYOU[18];
		B_IJYOU19.checked = n_B_IJYOU[19];
		B_IJYOU20.checked = n_B_IJYOU[20];
		if(Taijin==0){
			B_IJYOU21.checked = n_B_IJYOU[21];
			B_IJYOU22.checked = n_B_IJYOU[22];
			B_IJYOU23.value = n_B_IJYOU[23];
		}
		B_IJYOU24.value = n_B_IJYOU[24];
	}
	else{
		for(i=0;i<=20;i++){
			myInnerHtml("BI"+i+"_1","",0);
			myInnerHtml("BI"+i+"_2","",0);
		}
		if(Taijin==0){
			for(i=21;i<=23;i++){
				myInnerHtml("BI"+i+"_1","",0);
				myInnerHtml("BI"+i+"_2","",0);
			}
		}
		myInnerHtml("BI24_1","",0);
		myInnerHtml("BI24_2","",0);
	}
}}

function Click_EnemyKyoukaSW(){
with(document.calcForm){
	n_KyoukaSW = B_KYOUKASW.checked;

	if(n_KyoukaSW){
		var name_SKILL = ["加速术","圣母之祈福","速度激发(暂)","极限攻击","<Font size=2>爆气状态<BR>(ATK3倍DEX3倍)</Font>","速度強化(FLEE2倍)","属性变化","石化外壳","抵抗魔法","防御强化"];
		var html_SKILL = new Array();
		for(i=0;i<=1;i++)
			myInnerHtml("ID_K"+i,name_SKILL[i],0);

		html_SKILL[0] = '<select name="B_KYOUKA0"onChange="calc()"></select>';
		html_SKILL[1] = '<input type="checkbox" name="B_KYOUKA1"onClick="calc()">';
		html_SKILL[2] = '<input type="checkbox" name="B_KYOUKA2"onClick="calc()">';
		html_SKILL[3] = '<input type="checkbox" name="B_KYOUKA3"onClick="calc()">';
		html_SKILL[4] = '<input type="checkbox" name="B_KYOUKA4"onClick="calc()">';
		html_SKILL[5] = '<input type="checkbox" name="B_KYOUKA5"onClick="calc()">';
		html_SKILL[6] = '<select name="B_KYOUKA6"onChange="calc()"></select>';
		html_SKILL[7] = '<select name="B_KYOUKA7"onChange="calc()"></select>';
		html_SKILL[8] = '<select name="B_KYOUKA8"onChange="calc()"></select>';
		html_SKILL[9] = '<input type="checkbox" name="B_KYOUKA9"onClick="calc()">';

		for(i=0;i<=1;i++)
			myInnerHtml("ID_Kb"+i,html_SKILL[i],0);

		for(i=0;i<=10;i++)
			B_KYOUKA0.options[i] = new Option(i,i);
		B_KYOUKA0.value = n_B_KYOUKA[0];
		B_KYOUKA1.checked = n_B_KYOUKA[1];

		if(Taijin==0){
			for(i=2;i<=9;i++)
				myInnerHtml("ID_K"+i,name_SKILL[i],0);
			for(i=2;i<=9;i++)
				myInnerHtml("ID_Kb"+i,html_SKILL[i],0);
			for(i=0;i<=5;i++){
				B_KYOUKA7.options[i] = new Option(i,i);
				B_KYOUKA8.options[i] = new Option(i,i);
			}
			var ZoHe =[["无","无1","无2","无3","无4","水1","水2","水3","水4","土1","土2","土3","土4","火1","火2","火3","火4","风1","风2","风3","风4","毒1","毒2","毒3","毒4","圣1","圣2","圣3","圣4","暗1","暗2","暗3","暗4","念1","念2","念3","念4","死1","死2","死3","死4"],
				[0,1,2,3,4,11,12,13,14,21,22,23,24,31,32,33,34,41,42,43,44,51,52,53,54,61,62,63,64,71,72,73,74,81,82,83,84,91,92,93,94]];
			for(i=0;i<=40;i++)
				B_KYOUKA6.options[i] = new Option(ZoHe[0][i],ZoHe[1][i]);
			B_KYOUKA2.checked = n_B_KYOUKA[2];
			B_KYOUKA3.checked = n_B_KYOUKA[3];
			B_KYOUKA4.checked = n_B_KYOUKA[4];
			B_KYOUKA5.checked = n_B_KYOUKA[5];
			B_KYOUKA6.checked = n_B_KYOUKA[6];
			B_KYOUKA7.value = n_B_KYOUKA[7];
			B_KYOUKA8.value = n_B_KYOUKA[8];
			B_KYOUKA9.checked = n_B_KYOUKA[9];
		}
	}
	else{
		for(i=0;i<=1;i++){
			myInnerHtml("ID_K"+i,"",0);
			myInnerHtml("ID_Kb"+i,"",0);
		}
		if(Taijin==0){
			for(i=2;i<=9;i++){
				myInnerHtml("ID_K"+i,"",0);
				myInnerHtml("ID_Kb"+i,"",0);
			}
		}
	}
}}

function ClickB_Enemy(){
with(document.calcForm){
	n_B = new Array();
	n_B2 = new Array();
	for(i=0;i<=22;i++){
		n_B[i] = MonsterOBJ[B_Enemy.value][i];
		n_B2[i] = n_B[i];
	}

	if(Taijin){
		n_B[3] = eval(B_ZOKUSEI.value);
		n_B[5] = eval(B_LV.value);
		n_B[7] = eval(B_VIT.value);
		n_B[8] = eval(B_AGI.value);
		n_B[9] = eval(B_INT.value);
		n_B[11] = eval(B_LUK.value);
		n_B[14] = eval(B_DEF.value);
		n_B[15] = eval(B_MDEF.value);

		JobHP_A = new Array(0,0.7,0.5,0.4,0.5,0.3,0.4,1.5,1.1,0.75,0.85,0.55,0.9,1.1,0.85,0.9,0.75,0.75,0.75,0.9,0,1.5,1.1,0.75,0.85,0.55,0.9,1.1,0.85,0.9,0.75,0.75,0.75,0.9);
		JobHP_B = new Array(5,  5,  5,  5,  5,  5,  5,  5,  5,   5,   5,   5,  5,  7,   5,6.5,   3,   3,   5,  5,5,  5,  5,   5,   5,   5,  5,  7,   5,6.5,   3,   3,   5,  5);

		
		w = 0;
		for(i=2;i<=n_B[5];i++)
			w += Math.round(JobHP_A[n_B[1]] * i);
		w = (JobHP_B[n_B[1]] * n_B[5]) + 35 + w;
		
		if(n_B[1] > 20)
			w = Math.floor(w *125 /100);
		n_B[6] = Math.floor(w * (100 + n_B[7]) / 100);
		n_B[6] += eval(B_TAISEI11.value);
		n_B[6] = Math.floor(n_B[6] * (100 + eval(B_TAISEI12.value)) /100);
		myInnerHtml("B_HP",n_B[6],0);

		
		n_B[23] = Math.floor(n_B[7] * 0.5) + Math.floor(n_B[7] * 0.3);
		n_B[24] = Math.floor(n_B[7] * 0.5) + Math.floor(n_B[7] * n_B[7] / 150) -1;
		if(n_B[23] > n_B[24])
			n_B[24] = n_B[23];
		w = eval(B_TAISEI4.value);
		if(w){
			n_B[23] *= (1 + 0.05 * w);
			n_B[24] *= (1 + 0.05 * w);
		}
	}else{
		
		n_B2[23] = n_B[7];
		n_B2[24] = n_B[7] + (Math.floor(n_B[7]/20) * Math.floor(n_B[7]/20) -1);
		if(n_B2[23] > n_B2[24])
			n_B2[24] = n_B2[23];
	}
	n_B2[25] = Math.floor(n_B[7] / 2) + n_B[9];
	n_B2[26] = n_B[5] + n_B[10];
	n_B2[27] = n_B[5] + n_B[8];

	if(n_IjyouSW){
		n_B_IJYOU[0] = eval(B_IJYOU0.value);
		n_B_IJYOU[1] = eval(B_IJYOU1.value);
		n_B_IJYOU[2] = B_IJYOU2.checked;
		n_B_IJYOU[3] = B_IJYOU3.checked;
		n_B_IJYOU[4] = B_IJYOU4.checked;
		n_B_IJYOU[5] = B_IJYOU5.checked;
		n_B_IJYOU[6] = B_IJYOU6.checked;
		n_B_IJYOU[7] = B_IJYOU7.checked;
		n_B_IJYOU[8] = B_IJYOU8.checked;
		n_B_IJYOU[9] = B_IJYOU9.checked;
		n_B_IJYOU[10] = B_IJYOU10.checked;
		n_B_IJYOU[11] = eval(B_IJYOU11.value);
		n_B_IJYOU[12] = eval(B_IJYOU12.value);
		n_B_IJYOU[13] = B_IJYOU13.checked;
		n_B_IJYOU[14] = B_IJYOU14.checked;
		n_B_IJYOU[15] = B_IJYOU15.checked;
		n_B_IJYOU[16] = B_IJYOU16.checked;
		n_B_IJYOU[17] = B_IJYOU17.checked;
		n_B_IJYOU[18] = eval(B_IJYOU18.value);
		n_B_IJYOU[19] = B_IJYOU19.checked;
		n_B_IJYOU[20] = B_IJYOU20.checked;
		n_B_IJYOU[24] = eval(B_IJYOU24.value);
		if(Taijin==0){
			n_B_IJYOU[21] = B_IJYOU21.checked;
			n_B_IJYOU[22] = B_IJYOU22.checked;
			n_B_IJYOU[23] = eval(B_IJYOU23.value);
		}
	}
	if(n_KyoukaSW){
		n_B_KYOUKA[0] = eval(B_KYOUKA0.value);
		n_B_KYOUKA[1] = B_KYOUKA1.checked;
		if(Taijin==0){
			n_B_KYOUKA[2] = B_KYOUKA2.checked;
			n_B_KYOUKA[3] = B_KYOUKA3.checked;
			n_B_KYOUKA[4] = B_KYOUKA4.checked;
			n_B_KYOUKA[5] = B_KYOUKA5.checked;
			n_B_KYOUKA[6] = eval(B_KYOUKA6.value);
			n_B_KYOUKA[7] = eval(B_KYOUKA7.value);
			n_B_KYOUKA[8] = eval(B_KYOUKA8.value);
			n_B_KYOUKA[9] = B_KYOUKA9.checked;
		}
	}
	if(n_B_KYOUKA[6])
		n_B[3] = n_B_KYOUKA[6];
	if(n_B_IJYOU[23])
		n_B[3] = n_B_IJYOU[23] * 10 + (n_B[3] % 10);

	if(n_B_KYOUKA[4]){
		n_B[12] = n_B[12] * 3;
		n_B[13] = n_B[13] * 3;


	}
	if(n_B_KYOUKA[3])
		n_B[12] = n_B[13];

	if(n_B_KYOUKA[0])
		n_B[8] += 2 + n_B_KYOUKA[0];

	if(n_B_IJYOU[1]){
		if(Taijin){
			w2 = n_B_IJYOU[1] * 5;
			w = Math.floor(n_B[8] / 4);
		}else{
			w2 = n_B_IJYOU[1] * 10
			w = Math.floor(n_B[8] / 2);
		}
		if(w > w2)
			n_B[8] -= w2;
		else
			n_B[8] -= w;
		if(Taijin)
			w = Math.floor(n_B[10] / 4);
		else
			w = Math.floor(n_B[10] / 2);
		if(w > w2)
			n_B[10] -= w2;
		else
			n_B[10] -= w;
	}

	if(n_B[19] == 0){
		if(n_B_IJYOU[5] && (n_B[2]==6||n_B[3]>=90)){
			n_B[10] = n_B[10] - Math.floor(n_B[10] /2);
			n_B[9] = n_B[9] - Math.floor(n_B[9] /2);
		}
		if(n_B_IJYOU[10]){
			n_B[11] = 0;
			n_B[12] -= Math.floor(n_B[12] * 25 /100);
			n_B[13] -= Math.floor(n_B[13] * 25 /100);
		}
		if(n_B_IJYOU[11]){
			n_B[8] -= (n_B_IJYOU[11] + 2);
			if(n_B[8] < 0)
				n_B[8]=0;
		}
	}

	if(n_B_IJYOU[15] && Taijin==0)
		n_B[7] -= Math.floor(n_B[7] * 40 /100);
	if(n_B_IJYOU[16] && Taijin==0)
		n_B[9] -= Math.floor(n_B[9] * 40 /100);

	if(Taijin==0){
		
		n_B[23] = n_B[7];
		n_B[24] = n_B[7] + (Math.floor(n_B[7]/20) * Math.floor(n_B[7]/20) -1);
		if(n_B[23] > n_B[24])
			n_B[24] = n_B[23];
	}
	n_B[25] = Math.floor(n_B[7] / 2) + n_B[9];
	n_B[26] = n_B[5] + n_B[10];
	n_B[27] = n_B[5] + n_B[8];


	xiATK=0;
	xiDEF=0;
	if(n_B[19] == 0){
		if(n_B_IJYOU[0]!=0 && n_B[3]<90){
			xiDEF += 5 + n_B_IJYOU[0] * 5;
			xiATK += 2 + n_B_IJYOU[0] * 3;
		}
		if(n_B_IJYOU[2]){
			n_B[14] -= Math.floor(n_B[14] * 25 / 100);
			n_B[23] -= Math.floor(n_B[23] * 25 / 100);
			n_B[24] -= Math.floor(n_B[24] * 25 / 100);
		}
		if(n_B_IJYOU[3]){
			n_B[26] -= 25;
			if(n_B[26] < 1)
				n_B[26] = 1;
			n_B[27] -= Math.floor(n_B[27] * 25 / 100);
		}
	}
	if(n_B_KYOUKA[5])
		n_B[27] = n_B[27] * 2;
	if(Taijin==0){
		if(n_B_IJYOU[22]){
			xiDEF += 50;
			xiATK += 300;
		}
		if(n_B_IJYOU[24])
			xiDEF += 5 * n_B_IJYOU[24];
	}
	if(xiDEF > 100)
		xiDEF=100;
	if(Taijin==0)
		n_B[14] -= Math.floor(n_B[14] * xiDEF /100);
	n_B[23] -= Math.floor(n_B[23] * xiDEF /100);
	n_B[24] -= Math.floor(n_B[24] * xiDEF /100);
	n_B[12] += Math.floor(n_B[12] * xiATK /100);
	n_B[13] += Math.floor(n_B[13] * xiATK /100);

	
	var w = StPlusCalc2(300 + n_B[2]) + StPlusCard(300 + n_B[2]);
	w += StPlusCalc2(290) + StPlusCard(290);
	if(w){
		if(w < 0)
			w = 0;
		n_B[14] -= Math.floor(n_B[14] * w /100);
	}
	
	var w = StPlusCalc2(310 + n_B[2]) + StPlusCard(310 + n_B[2]);
	w += StPlusCalc2(295) + StPlusCard(295);
	if(EquipNumSearch(645))
		w += 10 + n_A_Weapon_ATKplus;
	if(n_A_WeaponType==9)
		w += 2 * CardNumSearch(466);
	if(n_B[19]==1 && CardNumSearch(425))
		w += 30 * CardNumSearch(425);
	if(w){
		if(w < 0)
			w = 0;
		n_B[15] -= Math.floor(n_B[15] * w /100);
	}

	if(n_B_IJYOU[13] && Taijin==0){
		n_B[12] -= Math.floor(n_B[12] * 25 /100);
		n_B[13] -= Math.floor(n_B[13] * 25 /100);
	}
	if(n_B_IJYOU[14] && Taijin==0)
		n_B[14] -= Math.floor(n_B[14] * 15 /100);
	if(n_B[19] == 0){
		if(n_B_IJYOU[17]){
			n_B[27] -= 50;
			if(n_B[27] < 1)
				n_B[27] = 1;
		}
		
		if(n_B_IJYOU[18] && n_B[3]<90)
			n_B[25] -= Math.floor(n_B[25] * (n_B_IJYOU[18] * 12) / 100);
		if(n_B_IJYOU[4] && n_B[2]!=1){
			n_B[3] = 11;
			n_B[14] -= Math.floor(n_B[14] * 50 /100);
			n_B[23] -= Math.floor(n_B[23] * 50 /100);
			n_B[24] -= Math.floor(n_B[24] * 50 /100);
			n_B[15] += Math.floor(n_B[15] * 25 /100);
			n_B[27] = -19;
		}
		if(n_B_IJYOU[7] || n_B_IJYOU[8])
			n_B[27] = -19;
		if(n_B_IJYOU[9] && n_B[2]!=1){
			n_B[3] = 21;
			n_B[14] -= Math.floor(n_B[14] * 50 /100);
			n_B[23] -= Math.floor(n_B[23] * 50 /100);
			n_B[24] -= Math.floor(n_B[24] * 50 /100);
			n_B[15] += Math.floor(n_B[15] * 25 /100);
			n_B[27] = -19;
		}
	}

	if(n_B_KYOUKA[9])
		n_B[14] *= 2;

	if(Taijin==0 && n_B_KYOUKA[8]){
		n_B[23] -= Math.floor(n_B[23] * 20 * n_B_KYOUKA[8] /100);
		n_B[24] -= Math.floor(n_B[24] * 20 * n_B_KYOUKA[8] /100);
	}
	if(Taijin==0 && n_B_KYOUKA[7])
		n_B[25] -= Math.floor(n_B[25] * 20 * n_B_KYOUKA[7] /100);

	if(Taijin==0){
		if(n_B_IJYOU[21]){
			n_B[24] += 90;
			n_B[25] = 90;
		}
	}
	if(n_B_IJYOU[20]){
		n_B[14] = 0;
		n_B[23] = 0;
		n_B[24] = 0;
	}
	if(n_B_IJYOU[12] && (n_B[2]==6||n_B[3]>=90))
		n_B[14] -= Math.floor(n_B[14] * (10 + n_B_IJYOU[12] * 4) /100);

	
	if(Taijin==0){
		w1_Exp = StPlusCard(120+n_B[2]);
		w1_Exp += StPlusCalc2(120+n_B[2]);
		if(EquipNumSearch(1030))
			w1_Exp += 5 * EquipNumSearch(1030);
		if(n_A_JobSearch()==3 && CardNumSearch(452) && (n_B[2]==1 || n_B[2]==6))
			w1_Exp += 5;
		if(n_B[2] == 2 && n_A_JobSearch()==4 && CardNumSearch(453))
			w1_Exp += 5;
		if(w1_Exp != 0){
			n_B[16] = Math.floor(n_B[16] * (100+w1_Exp)/100);
			n_B[17] = Math.floor(n_B[17] * (100+w1_Exp)/100);
		}
		if(n_B[19]==0){
			if(n_Skill3SW)
				n_A_PassSkill3[8] = eval(A3_Skill8.value);
			if(n_A_PassSkill3[8]){
				n_B[16] = Math.floor(n_B[16] * (125 + 11 * n_A_PassSkill3[8]) /100);
				n_B[17] = Math.floor(n_B[17] * (125 + 11 * n_A_PassSkill3[8]) /100);
			}
		}
	}

	if(n_B_KYOUKA[4]){
		n_B[26] = n_B[26] * 2;
	}
	
	n_B[21] = n_B[27] + 20;
	n_B[22] = n_B[26] + 75;
	if(Taijin == 0)
	{
		myInnerHtml("B_AA","+",0);
		myInnerHtml("B_AB","+",0);
		wIJ = [6,12,13,21,22,14,15,23,25];
		wIJ2 = [16,17];
		wFront = "<Font color='BLUE'><B>";
		wFront2 = "<Font color='RED'><B>";
		wBack = "</B></Font>";

		for(i=0;i<=8;i++){
			wIJstr = n_B[wIJ[i]];
			if(n_B[wIJ[i]] < n_B2[wIJ[i]])
				wIJstr =  wFront + n_B[wIJ[i]] + wBack;
			if(n_B[wIJ[i]] > n_B2[wIJ[i]])
				wIJstr =  wFront2 + n_B[wIJ[i]] + wBack;
			myInnerHtml("B_"+wIJ[i],wIJstr,0);
		}
		for(i=0;i<=1;i++){
			wIJstr = n_B[wIJ2[i]];
			if(n_B[wIJ2[i]] < n_B2[wIJ2[i]])
				wIJstr =  wFront2 + n_B[wIJ2[i]] + wBack;
			if(n_B[wIJ2[i]] > n_B2[wIJ2[i]])
				wIJstr =  wFront + n_B[wIJ2[i]] + wBack;
			myInnerHtml("B_"+wIJ2[i],wIJstr,0);
		}

		myInnerHtml("B_2",SyuzokuOBJ[n_B[2]],0);
		w = Math.floor(n_B[3] / 10);
		if(n_B[3] != n_B2[3])
			myInnerHtml("B_3",wFront2 +(ZokuseiOBJ[w] + n_B[3] % 10)+ wBack,0);
		else
			myInnerHtml("B_3",(ZokuseiOBJ[w] + n_B[3] % 10),0);
		myInnerHtml("B_4",SizeOBJ[n_B[4]],0);
	}
	else{
		n_B[27] += eval(B_TAISEI7.value);
		n_Ses = document.calcForm.B_Ses.checked;
		if(n_Ses){
			n_B[27] = Math.floor(n_B[27] *0.8);
		}
	}

	n_B_DEF2 = [0,0,0];
	n_B_DEF2[2] = n_B[23];
	n_B_DEF2[0] = n_B[24];
	n_B_DEF2[1] = Math.floor((n_B_DEF2[2] + n_B_DEF2[0]) /2);
	n_B_MDEF2 = n_B[25];
	n_B_HIT = n_B[26];
	n_B_FLEE = n_B[27];
}}

function calc()
{
	StAllCalc();




	wCSize = weaponsize[n_A_WeaponType][n_B[4]];
	if(SkillSearch(78)){
		if((n_A_WeaponType==4 || n_A_WeaponType==5) && n_B[4]==1)
			wCSize = 1;
	}
	if(SkillSearch(153) || n_A_PassSkill2[7])
		wCSize = 1;
	
	if(cardOBJ[n_A_card[0]][0]==32||cardOBJ[n_A_card[1]][0]==32||cardOBJ[n_A_card[2]][0]==32||cardOBJ[n_A_card[3]][0]==32||cardOBJ[n_A_card[4]][0]==32||cardOBJ[n_A_card[5]][0]==32||cardOBJ[n_A_card[6]][0]==32||cardOBJ[n_A_card[7]][0]==32)
		wCSize = 1;

	
	wImp = n_A_PassSkill2[2] *5;

	
	w_HIT = n_A_HIT + 80 - (n_B_FLEE);
	w_HIT_EDP = w_HIT;
	if(w_HIT_EDP > 100)
		w_HIT_EDP = 100;
	if(w_HIT_EDP < 5)
		w_HIT_EDP = 5;
	if(SkillSearch(148))
		w_HIT = Math.floor(w_HIT * (100 + 2 * SkillSearch(148))/100);
	if(n_A_ActiveSkill==70 || n_A_ActiveSkill==6){
		w_HIT *= 1+n_A_ActiveSkillLV *0.05;
	}
	if((n_A_ActiveSkill==83 || n_A_ActiveSkill==388)&& SkillSearch(381)){
		w_HIT *= 1.5;
	}
	if(n_A_ActiveSkill==7){
		w_HIT *= 1+n_A_ActiveSkillLV *0.1;
	}
	if(n_A_ActiveSkill==272){
		w_HIT *= (1 + n_A_ActiveSkillLV * 0.1);
	}
	if(n_A_ActiveSkill==337){
		w_HIT = 100;
	}
	if(n_A_ActiveSkill==384){
		w_HIT = 100;
	}
	if(SkillSearch(364)){
		w_HIT = 100;
	}
	if(w_HIT > 100){
		w_HIT = 100;
	}else if(w_HIT < 5){
		w_HIT = 5;
	}
	if(StPlusCalc2(86)+StPlusCard(86))
		w_HIT = w_HIT + (100 - w_HIT) * (StPlusCalc2(86)+StPlusCard(86)) / 100;

	w_HIT = Math.floor(w_HIT *100)/100;
	w_HIT_HYOUJI = w_HIT;

	if(n_A_ActiveSkill==272)
		n_A_CRI += 20;
	if(n_A_ActiveSkill==401)
		n_A_CRI += 25 + n_A_ActiveSkillLV * 5;
	w_Cri = n_A_CRI - n_B[11] * 0.2 - 0.1;
	if(n_B_IJYOU[8])
		w_Cri *= 2;
	if(w_Cri < 0){
		w_Cri = 0;
	}
	else if(w_Cri > 100){
		w_Cri = 100;
	}



	TyouEnkakuSousa3dan = 0;
	wBC3_3danHatudouRitu = 0;
	if(SkillSearch(187))
		wBC3_3danHatudouRitu = 30 - SkillSearch(187);

	
	wDA = SkillSearch(13) * 5;
	if(n_A_WeaponType != 1)
		wDA = 0;
	if(CardNumSearch(43)){
		if(SkillSearch(13) > 1)
			wDA = SkillSearch(13) * 5;
		else
			wDA = 5;
	}
	if(EquipNumSearch(570) && n_A_WeaponType != 0){
		if(SkillSearch(13) > 1)
			wDA = SkillSearch(13) * 5;
		else
			wDA = 10;
	}
	if(EquipNumSearch(1035) && n_A_WeaponType != 0){
		if(SkillSearch(13) > 5)
			wDA = SkillSearch(13) * 5;
		else
			wDA = 25;
	}
	if(EquipNumSearch(399)){
		if(SkillSearch(13) > 5)
			wDA = SkillSearch(13) * 5;
		else
			wDA = 25;
	}
	if(n_A_WeaponType == 17){
		wDA = SkillSearch(427) * 5;
		if(CardNumSearch(43))
			wDA = SkillSearch(427) * 5 + ((100 - SkillSearch(427) * 5) * 5 /100);
		if(EquipNumSearch(570))
			wDA = SkillSearch(427) * 5 + ((100 - SkillSearch(427) * 5) * 10 /100);
	}
	w_HIT_DA = w_HIT;
	if(wDA != 0 && n_A_WeaponType != 17){
		w_HIT_DA = w_HIT_DA * (100 + SkillSearch(13)) /100;
		if(w_HIT_DA >= 100)
			w_HIT_DA=100;
	}

	w998A = 100 - wBC3_3danHatudouRitu;
	w998B = wBC3_3danHatudouRitu * w_HIT /100;
	w998C = wBC3_3danHatudouRitu - w998B;
	w998D = w998A * wDA /100;
	w998E = w998D * w_HIT_DA /100;
	w998F = w998D - w998E;
	w998G = (100-wBC3_3danHatudouRitu-w998D) * w_Cri /100;
	w998H = 100 - wBC3_3danHatudouRitu -w998D -w998G;
	w998I = w998H * w_HIT /100;
	w998J = w998H - w998I;
	w998K = w998B +w998E +w998G +w998I;
	w998L = 100 -w998K;
	


	if(n_A_ActiveSkill==0 || n_A_ActiveSkill==272 || n_A_ActiveSkill==401 || (n_A_ActiveSkill==86 && (50 <= n_B[3] && n_B[3] < 60))){
		w_HIT_HYOUJI = Math.floor(w998K * 100) /100;
		myInnerHtml("CRInum",(Math.round(w998G * 100) / 100) + SubName[0],0);
	}
	
	w_FLEE = n_A_FLEE + 20 - (n_B_HIT);
	if(w_FLEE > 95){
		w_FLEE = 95;
	}else if(w_FLEE < 5){
		w_FLEE = 5;
	}
	if(Taijin==0)
		myInnerHtml("BattleFLEE",Math.floor((w_FLEE + (100 - w_FLEE) * n_A_LUCKY / 100) * 100) / 100,0);

	n_A_workDEX = Math.floor(n_A_DEX * (1 + (n_A_WeaponLV - 1) * 0.2));

	n_A_DMG = [0,0,0];

	
	if(n_A_workDEX>=n_A_Weapon_ATK || SkillSearch(155))
		n_A_DMG[2] = n_A_ATK + n_A_WeaponLV_Maxplus + Math.floor((n_A_Weapon_ATK + wImp)* wCSize);
	else
		n_A_DMG[2] = n_A_ATK + n_A_WeaponLV_Maxplus + Math.floor((n_A_Weapon_ATK-1 + wImp)* wCSize);
	
	if(n_A_WeaponType==10||n_A_WeaponType==17||n_A_WeaponType==18||n_A_WeaponType==19||n_A_WeaponType==20||n_A_WeaponType==21)
		n_A_DMG[2] += Math.floor((ArrowOBJ[n_A_Arrow][0]-1) * wCSize);
	

	if(n_A_WeaponType==10||n_A_WeaponType==17||n_A_WeaponType==18||n_A_WeaponType==19||n_A_WeaponType==20||n_A_WeaponType==21)
	{
		w1 = n_A_ATK + n_A_WeaponLV_Maxplus + Math.floor(n_A_Weapon_ATK * n_A_Weapon_ATK / 100 * wCSize) + Math.floor(wImp * wCSize);
		w2 = n_A_ATK + n_A_WeaponLV_Maxplus + Math.floor(n_A_Weapon_ATK * n_A_workDEX / 100 * wCSize) + Math.floor(wImp * wCSize);
		
		w = Math.floor((ArrowOBJ[n_A_Arrow][0]-1) * wCSize);
		w1 += w;
		w2 += w;
		if(w1 > w2)w1 = w2;
		if(n_A_DMG[2] < w1)n_A_DMG[2] = w1;
	}

	
	

	if(n_A_WeaponType==10||n_A_WeaponType==17||n_A_WeaponType==18||n_A_WeaponType==19||n_A_WeaponType==20||n_A_WeaponType==21)
	{
		n_A_DMG[0] = n_A_ATK + n_A_WeaponLV_Minplus + Math.floor((n_A_Weapon_ATK * n_A_Weapon_ATK / 100 +wImp) * wCSize);
		w = n_A_ATK + n_A_WeaponLV_Minplus + Math.floor((n_A_Weapon_ATK * n_A_workDEX / 100 + wImp) * wCSize);
		if(n_A_DMG[0] > w)n_A_DMG[0] = w;
	}
	else{
		if(n_A_workDEX >= n_A_Weapon_ATK) 
			n_A_DMG[0] = n_A_ATK + n_A_WeaponLV_Minplus + Math.floor((n_A_Weapon_ATK + wImp) * wCSize);
		else{
			
			if(SkillSearch(155))
				n_A_workDEX = n_A_Weapon_ATK;
			n_A_DMG[0] = n_A_ATK + n_A_WeaponLV_Minplus + Math.floor((n_A_workDEX + wImp) * wCSize);
		}
	}

	
	n_A_DMG[1] = (n_A_DMG[0] + n_A_DMG[2]) / 2;

	
	n_Enekyori=0;
	n_A_CriATK = [0,0,0];
	n_A_CriATK[1] = n_A_ATK + (n_A_WeaponLV_Minplus + n_A_WeaponLV_Maxplus) /2 + Math.floor((n_A_Weapon_ATK + wImp)* wCSize);
	n_A_CriATK[0] = n_A_ATK + n_A_WeaponLV_Minplus + Math.floor((n_A_Weapon_ATK + wImp)* wCSize);
	n_A_CriATK[2] = n_A_ATK + n_A_WeaponLV_Maxplus + Math.floor((n_A_Weapon_ATK + wImp)* wCSize);
	
	if(n_A_WeaponType==10 || 17<=n_A_WeaponType && n_A_WeaponType <= 21){
		n_Enekyori=1;
		if(n_A_WeaponType==10){
			for(i=0;i<=2;i++)
				n_A_CriATK[i] += Math.floor((ArrowOBJ[n_A_Arrow][0]) * wCSize);
		}
	}

	
	BK_n_A_DMG = [0,0,0];
	BK_n_A_DMG[2] = n_A_DMG[2];
	BK_n_A_DMG[0] = n_A_DMG[0];
	BK_n_A_DMG[1] = n_A_DMG[1];

	ATKbai01();
	ATKbai02(1,1);

	n_PerHIT_DMG = BattleCalc2(0);

	wCriTyuu=1;
	n_A_CriATK[1] = BattleCalc(n_A_CriATK[1],10);
	n_A_CriATK[0] = BattleCalc(n_A_CriATK[0],10);
	n_A_CriATK[2] = BattleCalc(n_A_CriATK[2],10);
	wCriTyuu=0;

	
	n_A_EDP_DMG = [0,0,0];
	for(var i=0;i<=2;i++)
		n_A_EDP_DMG[i] = BattleCalcEDP(n_A_DMG[i],i);

	
	for(var i=0;i<=2;i++)
		n_A_CriATK[i] += EDP_DMG(i);

	var wk = [0,0,0];
	if(n_A_WeaponType == 11){
		for(var i=0;i<=2;i++){
			wk[i] = Math.floor(n_A_CriATK[i] * (0.01 + SkillSearch(13) * 0.02));
			n_A_CriATK[i] += wk[i];
		}
		if(n_A_CriATK[0] == n_A_CriATK[2])
			myInnerHtml("CRIATK",n_A_CriATK[0] +"("+ (n_A_CriATK[0] - wk[0]) +"+"+ wk[0] +")",0);
		else
			myInnerHtml("CRIATK",n_A_CriATK[0] +"～"+ n_A_CriATK[2] +"("+ (n_A_CriATK[0] - wk[0]) +"～"+ (n_A_CriATK[2] - wk[2]) +"+"+ wk[0] +"～"+ wk[2] +")",0);
	}else{
		if(n_A_CriATK[0] == n_A_CriATK[2])
			myInnerHtml("CRIATK",n_A_CriATK[1],0);
		else
			myInnerHtml("CRIATK",n_A_CriATK[0] +"～"+ n_A_CriATK[2],0);
	}

	n_Max_DMG = 0;
	n_Min_DMG = 9999999;
	if((n_A_ActiveSkill==0  || (n_A_ActiveSkill==86 && (50 <= n_B[3] && n_B[3] < 60))) && w998G > 0){
		n_Min_DMG = n_A_CriATK[0];
		n_Max_DMG = n_A_CriATK[2];
	}

	BattleCalc999();
}


function BattleCalc(w_atk,w_2)
{
	
	if(w_2==10)
		w_atk += n_A_WeaponLV_seirenATK;
	else
		w_atk=BattleCalc4(w_atk,w_2,0);

	if(w_atk < 1)w_atk = 1;

	
	if(n_A_WeaponType == 1 || n_A_WeaponType == 2)w_atk += 4 * SkillSearch(3);
	else if(n_A_WeaponType == 3)w_atk += 4 * SkillSearch(4);
	else if(n_A_WeaponType == 4 || n_A_WeaponType == 5)
	{
		if(SkillSearch(78) == 0)
			w_atk += 4 * SkillSearch(69);
		else
			w_atk += 5 * SkillSearch(69);
		
	}
	else if(n_A_WeaponType == 11)w_atk += 3 * SkillSearch(81);
	else if(n_A_WeaponType == 8)w_atk += 3 * SkillSearch(89);
	else if(n_A_WeaponType == 13 || n_A_WeaponType == 0)w_atk += 3 * SkillSearch(183);
	else if(n_A_WeaponType == 14)w_atk += 3 * SkillSearch(198);
	else if(n_A_WeaponType == 15)w_atk += 3 * SkillSearch(206);
	else if(n_A_WeaponType == 12)w_atk += 3 * SkillSearch(224);
	else if(n_A_WeaponType == 6 || n_A_WeaponType == 7)w_atk += 3 *SkillSearch(241);

	if(n_A_WeaponType == 0 && SkillSearch(329))
		w_atk += 10 * SkillSearch(329);

	if(n_A_PassSkill3[10] && n_A_WeaponLV == 4)
		w_atk += 50 + 25 * n_A_PassSkill3[10];

	
	if(n_B[2] == 6 || (90 <= n_B[3] && n_B[3] <= 99)){
		if(SkillSearch(24))
			w_atk += Math.floor((3 + 5/100 * n_A_BaseLV) * SkillSearch(24));
	}
	if(n_B[2] == 2 || n_B[2] == 4){
		w_atk += 4 * SkillSearch(116);
		if(SkillSearch(390))
			w_atk += n_A_STR;
	}

	w_atk = BattleCalc2(w_atk);

	return Math.floor(w_atk);
}


function BattleCalc2(w999)
{
	
	w999_AB = 0;
	if(w999 > 0)
		w999_AB = 1;

	
	w999 += 2 * SkillSearch(148);

	
	if(wBCEDPch==0)
		w999 = w999 * zokusei[n_B[3]][n_A_Weapon_zokusei];

	
	if(n_A_WeaponType == 0 && SkillSearch(329))
		if(n_A_ActiveSkill==331 || n_A_ActiveSkill==333 || n_A_ActiveSkill==335 || n_A_ActiveSkill==337)
			w999 += 10 * SkillSearch(329);

	
	if(n_A_JOB==15||n_A_JOB==29)
		w999 += 3 * SkillSearch(185);
	else
		w999 += 3 * n_A_PassSkill2[10];
	
	w999 += 3 * SkillSearch(416);

	
	if(n_A_WeaponType != 0 && w999_AB == 1)
		w999 += 20 * SkillSearch(254);

	
	if(wBCEDPch==0){
		if(n_A_ActiveSkill==17 || n_A_ActiveSkill==307)
			w999 += 15 * n_A_ActiveSkillLV;
		if(n_A_ActiveSkill==86 && (n_B[3] < 50 ||  60 <= n_B[3]))
			w999 += 75;
	}
	if(n_A_ActiveSkill==423)
		w999 += Math.floor(n_A_MATK[w_MagiclBulet] * (100 - n_B[15]) /100 - n_B_MDEF2);
	if(n_A_ActiveSkill==437)
		w999 += n_A_ActiveSkillLV * 50;


	
	if(cardOBJ[n_A_card[0]][0]==106 && cardOBJ[n_A_card[1]][0]==106 && cardOBJ[n_A_card[2]][0]==106){
		w999 += 40;
	}else{
		for(i=0;i<=2;i++){
			if(cardOBJ[n_A_card[i]][0]==106)
				w999 += 5;
		}
	}
	if(n_A_card[3]==106)
		w999 += 10;

	
	if(n_A_ActiveSkill == 394){
		w999 += SyurikenOBJ[eval(document.calcForm.SkillSubNum.value)][0];
		w999 += 3 * SkillSearch(393);
		w999 += 4 * n_A_ActiveSkillLV;
	}
	
	if(n_A_ActiveSkill == 395)
		w999 += KunaiOBJ[eval(document.calcForm.SkillSubNum.value)][0] * 3;

	w999 = BaiCI(w999);

	
	if(n_A_ActiveSkill==169 && n_A_WeaponType==10)
		w999 = Math.floor(w999 / 2);

	
	if(n_Nitou && n_A_ActiveSkill==0){
		
		if(n_A_WeaponType != 0)
			w999 = Math.floor(w999 * (50 + SkillSearch(79) *10) /100);
	}






	if(n_A_ActiveSkill==423)
		w999 = w999 * zokusei[n_B[3]][8];
	if(n_A_ActiveSkill==437)
		w999 = w999 * zokusei[n_B[3]][0];
	if(Taijin==1)
		if(n_A_ActiveSkill==317 || n_A_ActiveSkill==318)
			w999 = 0;
			
	return w999;
}


function BaiCI(wBaiCI)
{
	
	if(wBCEDPch==0 && not_use_card == 0){
		
		w1=n_tok[30+n_B[2]];
		wBaiCI = Math.floor(wBaiCI * (100+w1) /100);

		
		w1=n_tok[40+Math.floor(n_B[3] / 10)];
		wBaiCI = Math.floor(wBaiCI * (100+w1) /100);

		
		w1=n_tok[27+n_B[4]];
		wBaiCI = Math.floor(wBaiCI * (100+w1) /100);

		
		if(n_Enekyori==1){
			if(TyouEnkakuSousa3dan != -1){
				w1=n_tok[25];
				wBaiCI = Math.floor(wBaiCI * (100+w1) /100);
			}
		}

		
		w1=0;
		if(n_B[19] == 1)
			w1 += n_tok[26];
		
		w1 += n_tok[80];
		wBaiCI = Math.floor(wBaiCI * (100+w1) /100);

		
		if(wCriTyuu==1 && n_A_ActiveSkill != 272 && n_A_ActiveSkill != 401)
			wBaiCI = Math.floor(wBaiCI * (100+ n_tok[70]) /100);

		
		if(108<=n_B[0] && n_B[0]<=115 || n_B[0]==319)
			wBaiCI = Math.floor(wBaiCI * (100+n_tok[81]) /100);
		
		if(116<=n_B[0] && n_B[0]<=120)
			wBaiCI = Math.floor(wBaiCI * (100+n_tok[82]) /100);
		
		if(49<=n_B[0] && n_B[0]<=52 || 55==n_B[0] || 221==n_B[0])
			wBaiCI = Math.floor(wBaiCI * (100+n_tok[83]) /100);
		
		if(106==n_B[0] || 152==n_B[0] || 308==n_B[0] || 32==n_B[0])
			wBaiCI = Math.floor(wBaiCI * (100+n_tok[84]) /100);

		
		wBaiCI = Math.floor(wBaiCI * (100+StPlusCalc2(1000+n_B[0])+StPlusCard(1000+n_B[0])) /100);

		if(SkillSearch(258))
			wBaiCI = wBaiCI * 2;
		if(SkillSearch(266))
			wBaiCI = Math.floor(wBaiCI * (150 + 50 * SkillSearch(266)) /100);
		if(n_A_ActiveSkill==86 && (50 <= n_B[3] && n_B[3] < 60))
			wBaiCI = Math.floor(wBaiCI * (100 + 30 * n_A_ActiveSkillLV) /100);

		
		if(n_A_WeaponType == 11 && SkillSearch(262))
			wBaiCI = Math.floor(wBaiCI * (110 + 2 * SkillSearch(262))/100);

		w1 = 0;
		if(Taijin == 0){
			if(SkillSearch(354) && SkillSearch(365))
				w1 += (n_A_BaseLV + n_A_STR + n_A_LUK + n_A_DEX) / (12 - SkillSearch(354) *3);
			else if(SkillSearch(354) && n_B[4]==2 && n_B[6] >= 17392)
				w1 += (n_A_BaseLV + n_A_STR + n_A_LUK + n_A_DEX) / (12 - SkillSearch(354) *3);
			else if(SkillSearch(352) && n_B[4]==0)
				w1 += (n_A_BaseLV + n_A_LUK + n_A_DEX) / (12 - SkillSearch(352) *3);
			else if(SkillSearch(353) && n_B[4]==1 && n_B[6] >= 5218)
				w1 += (n_A_BaseLV + n_A_LUK + n_A_DEX) / (12 - SkillSearch(353) *3);
		}else{
			if(SkillSearch(354)){
				w1 += (n_A_BaseLV + n_A_STR + n_A_LUK + n_A_DEX) / (12 - SkillSearch(354) *3);
			}else{
				 if(SkillSearch(352)){
					w1 += (n_A_BaseLV + n_A_LUK + n_A_DEX) / (12 - SkillSearch(352) *3);
				 }else{
					 if(SkillSearch(353))
						w1 += (n_A_BaseLV + n_A_LUK + n_A_DEX) / (12 - SkillSearch(353) *3);
				}
			}
		}
		wBaiCI = Math.floor(wBaiCI * (100+w1) /100);
	}

	wBaiCI = Math.floor(tPlusDamCut(wBaiCI));

	w1=0;
	
	if(n_A_ActiveSkill == 6)
		if(n_A_SHOES_DEF_PLUS >= 9 && CardNumSearch(362))
			w1 += 10;
	if(n_A_ActiveSkill == 76)
		if(n_A_WeaponType==2 || n_A_WeaponType==3)
			w1 += 25 * CardNumSearch(464);
	if(n_A_ActiveSkill == 41)
		if(n_A_WeaponType==10)
			w1 += 50 * CardNumSearch(465);
	if(n_A_ActiveSkill == 6 || n_A_ActiveSkill == 76)
		
		if(n_A_ActiveSkillLV == 10 && EquipNumSearch(1048))
			w1 += 50;
	if(n_A_ActiveSkill == 169)
		
			w1 += 15;
	if(n_A_ActiveSkill ==40||n_A_ActiveSkill ==272)
		
		if( EquipNumSearch(1044))
			w1 += 10;
	if(n_A_ActiveSkill ==264)
		
		if( EquipNumSearch(1074)&&SkillSearch(81)==10)
			w1 += 20;
	if(n_A_ActiveSkill ==84)
		
		if( EquipNumSearch(1066))
			w1 += 10;
	if(TyouEnkakuSousa3dan == -1 && EquipNumSearch(639))
		w1 += 15;
	
	if((n_A_ActiveSkill==83 || n_A_ActiveSkill==388) && SkillSearch(381) && wBCEDPch==0)
		w1 += 10;
	
	wBaiCI = wBaiCI * (100+StPlusCalc2(5000+n_A_ActiveSkill)+StPlusCard(5000+n_A_ActiveSkill) + w1) /100;

	return wBaiCI;
}


function BattleCalc3(w998)
{
	wBC3_3dan = w998B * TyouEnkakuSousa3dan;
	wBC3_DA = w998E * w998 * 2;
	wBC3_Cri = w998G * n_A_CriATK[1];
	wBC3_Normal = w998I * w998;
	wBC3_Miss = w998L * BattleCalc2(0);

	wBC3_X = (wBC3_3dan +wBC3_DA +wBC3_Cri +wBC3_Normal +wBC3_Miss) /100;

	return tPlusLucky(wBC3_X);
}


function BattleCalc3left(w998)
{
	
	wBC3L2 = 0;
	for(i=4;i<=7;i++){
		if(cardOBJ[n_A_card[i]][0]==106)
			wBC3L2 += 5;
	}

	wBC3_Normal = w998 * w_HIT /100;
	wBC3_Miss = wBC3L2 * (100-w_HIT) /100;

	wBC3_X = wBC3_Normal + wBC3_Miss;

	wBC3_X = tPlusDamCut(wBC3_X);

	return tPlusLucky(wBC3_X);
}



function SkillSearch(n)
{
	if(n==258 && CardNumSearch(178))
		return 1;

	for(k=0;k<=14;k++)
	{
		if(JobSkillPassOBJ[n_A_JOB][k] == n)
		{
			return n_A_PassSkill[k];
		}
	}
	return 0;
}


function BattleCalc4(wBC4,wBC4_2,wBC4_3){
	if(wBC4_3==0)
		wBC4_3=n_A_WeaponLV_seirenATK;
	else
		wBC4_3=n_A_Weapon2LV_seirenATK;
	if(n_A_ActiveSkill==275)
		return Math.floor(wBC4 * (100 - n_B[14]) /100) - n_B_DEF2[wBC4_2] + wBC4_3;
	if(n_tok[23] == 0)
	{
		if(n_A_ActiveSkill==432)
			return wBC4 + wBC4_3;
		if(n_tok[180+n_B[2]] >= 1)
			return wBC4 + wBC4_3;
		if(n_tok[22] >= 1 && n_B[19] == 0)
			return wBC4 + wBC4_3;
		if(n_tok[22] >= 10)
			return wBC4 + wBC4_3;
		if(SkillSearch(364))
			return wBC4 + wBC4_3;
		wBC4 = Math.floor(wBC4 * (100 - n_B[14]) /100) - n_B_DEF2[wBC4_2] + wBC4_3;
	}else{
		if(wBC4_2==0){
			wBC4 = Math.floor(wBC4 * (n_B_DEF2[2]+n_B[14])/100) +wBC4_3;
		}else if(wBC4_2==1){
			wBC4 = Math.floor(wBC4 * (n_B_DEF2[1]+n_B[14])/100) +wBC4_3;
		}else{
			wBC4 = Math.floor(wBC4 * (n_B_DEF2[0]+n_B[14])/100) +wBC4_3;
		}
	}
	return wBC4;
}



function BattleCalcEDP(wBCEDP,wBCEDP2){
	if(wBCEDP <= 0)
		return 0;


	
	if(n_A_ActiveSkill == 19 || n_A_ActiveSkill == 263 || n_A_ActiveSkill == 88 || n_A_ActiveSkill == 264 || n_A_ActiveSkill == 248)
		return 0;
	wBCEDPch=1;
	var x=0;
	var y=0;
	if(SkillSearch(266)){
		x = BattleCalc(wBCEDP,wBCEDP2);
		x = Math.floor((x * zokusei[n_B[3]][5])/4);
	}
	if(n_A_PassSkill2[11]){
		y = BattleCalc(wBCEDP,wBCEDP2);
		y = Math.floor((y * zokusei[n_B[3]][3]) /5);
	}
	wBCEDPch=0;
	return x + y;
}


function EDPplus(HitNum){
	if(SkillSearch(266) || n_A_PassSkill2[11]){
		w_DMG[2] += EDP_DMG(2) * HitNum;
		w_DMG[1] += EDP_DMG(1) * HitNum;
		if(w_HIT_EDP == 100)
			w_DMG[0] += EDP_DMG(0) * HitNum;
		EDPhyouzi(HitNum);
	}
}


function EDPhyouzi(HitNum){
/*	if(SkillSearch(266) || n_A_PassSkill2[11]){
		var wE = 0;
		if(w_HIT_HYOUJI == 100)
			wE = 1;
		if(n_PerHIT_DMG)
			wE = 1;
		str_bSUBname += "MB/EDP捛寕晹暘<BR>";
		var w0 = n_A_EDP_DMG[0] * HitNum;
		var w2 = n_A_EDP_DMG[2] * HitNum;
		if(wE)
			str_bSUB += w0 +"～"+ w2 +"(捛壛敪摦棪"+ w_HIT_EDP +"%)<BR>";
		else
			str_bSUB += w0 +"～"+ w2 +"(捛壛敪摦棪"+ (Math.floor(w_HIT * w_HIT_EDP) / 100) +"%)<BR>";
	}*/
}



function EDP_DMG(num){
	if(SkillSearch(266) || n_A_PassSkill2[11]){
		if(n_A_ActiveSkill == 17 && 52 <= n_B[3] && n_B[3] <= 59)
			return 0;
		if((n_A_ActiveSkill == 66 || n_A_ActiveSkill == 193 || n_A_ActiveSkill == 197 || n_A_ActiveSkill == 321) && 83 <= n_B[3] && n_B[3] <= 89)
			return 0;
		if(zokusei[n_B[3]][n_A_Weapon_zokusei] <= 0 && n_PerHIT_DMG == 0)
			return 0;

		if(num == 0){
			if(w_HIT_EDP == 100)
				return n_A_EDP_DMG[0];
			else
				return 0;
		}
		if(num == 1){
			var wE = 0;
			if(w_HIT_HYOUJI == 100)
				wE = 1;
			if(n_PerHIT_DMG)
				wE = 1;
			if(wE)
				return Math.floor(n_A_EDP_DMG[1] * w_HIT_EDP / 100);
			else
				return Math.floor(n_A_EDP_DMG[1] * w_HIT / 100 * w_HIT_EDP / 100);
		}
		if(num == 2)
			return n_A_EDP_DMG[2];
	}
	return 0;
}


function CastAndDelay(){
	if(wCast != 0){
		str_bSUBname += SubName[9] +"<BR>";
		str_bSUB += Math.floor(wCast *100)/100 + SubName[1] +"<BR>";
	}

	var strSUB2name = "";
	var strSUB2 = "";








	wDelay = 0;
	var w = 0;
	if(n_Delay[1] > wDelay){
		wDelay = n_Delay[1];
		w = 1;
	}
	n_Delay[2] = Math.floor(n_Delay[2] * (100 - n_tok[74])) / 100;
	if(n_Delay[2] > wDelay){
		wDelay = n_Delay[2];
		w = 2;
	}
	if(n_Delay[3] > wDelay){
		wDelay = n_Delay[3];
		w = 3;
	}
	if(n_A_ActiveSkill != 0 && n_A_ActiveSkill != 284){
		n_Delay[4] = eval(document.calcForm.Conf01.value) /100;
	}
	if(n_Delay[4] > (wDelay + wCast)){
		wDelay = n_Delay[4] - wCast;
		w = 4;
	}
	if(n_Delay[5] != 0){
		wDelay = n_Delay[5];
		w = 5;
	}

	if(w == 1){
		if(n_A_ActiveSkill == 0){
			if(SkillSearch(187)){
				strSUB2name += "攻击间隔(通常)<BR>攻击间隔(六合拳)<BR>";
				strSUB2 += n_Delay[1] +"秒<BR>"+ sandanDelay +"秒<BR>";
				wDelay = n_Delay[1] * w998A /100 + sandanDelay * wBC3_3danHatudouRitu / 100;


			}
			else{
				strSUB2name += "攻击间隔<BR>";
				strSUB2 += n_Delay[1] +"秒<BR>";
			}
		}
		else{
			strSUB2name += "<Font size=2>延迟(ASPD)</Font></Font><BR>";
			strSUB2 += n_Delay[1] +"秒<BR>";
		}
	}
	if(w == 2){
		strSUB2name += "<Font size=2>延迟(固定)</Font><BR>";
		strSUB2 += n_Delay[2] +"秒<BR>";
	}
	if(w == 3){
		strSUB2name += "<Font size=2>延迟(强制)</Font><BR>";
		strSUB2 += n_Delay[3] +"秒<BR>";
	}
	if(w == 4){
		strSUB2name += "<Font size=2>延迟(限制)</Font><BR>";
		strSUB2 += n_Delay[4] +"秒<BR>";
	}
	if(w == 5){
		strSUB2name += "<Font size=2>间隔</Font><BR>";
		strSUB2 += n_Delay[5] +"秒<BR>";
	}

	myInnerHtml("bSUB2name",strSUB2name,0);
	myInnerHtml("bSUB2",strSUB2,0);
}





function tPlusDamCut(wPDC){
if(Taijin){
	
	if(n_Ses){
		if(n_A_WeaponType==10||n_A_WeaponType==17||n_A_WeaponType==18||n_A_WeaponType==19||n_A_WeaponType==20||n_A_WeaponType==21)
			wPDC = Math.floor(wPDC *0.6);
		else if(n_A_ActiveSkill != 0)
			wPDC = Math.floor(wPDC *0.6);
		else
			wPDC = Math.floor(wPDC *0.8);
	}

	
	w = eval(document.calcForm.B_TAISEI0.value);
	wPDC = Math.floor(wPDC * (100-w) / 100);

	
	if(n_Enekyori || n_A_WeaponType == 10){
		w = eval(document.calcForm.B_TAISEI1.value);
		wPDC = Math.floor(wPDC * (100-w) / 100);
	}

	
	w = eval(document.calcForm.B_TAISEI2_1.value);
	if(n_A_Weapon_zokusei == w){
		w = eval(document.calcForm.B_TAISEI2_2.value);
		wPDC = Math.floor(wPDC * (100-w) / 100);
	}
	w = eval(document.calcForm.B_TAISEI3_1.value);
	if(n_A_Weapon_zokusei == w){
		w = eval(document.calcForm.B_TAISEI3_2.value);
		wPDC = Math.floor(wPDC * (100-w) / 100);
	}

	
	w = eval(document.calcForm.B_TAISEI5.value);
	if(w != 0 && (n_Enekyori==1 || n_A_WeaponType == 10)){
		w = 95 - eval(document.calcForm.B_TAISEI5.value) *15;
		wPDC = Math.floor(wPDC * w / 100);
	}
}

	if(wBTw1==0){
		if(n_B_IJYOU[6] && wLAch==0)
			wPDC *= 2;
		if(n_B_IJYOU[17] && n_A_Weapon_zokusei == 3)
			wPDC *= 2;
		baizok = [110,114,117,119,120];
		if(n_A_PassSkill6[0] == 0 && n_A_PassSkill6[1] >= 1 && n_A_Weapon_zokusei == 3)
			wPDC = Math.floor(wPDC * baizok[n_A_PassSkill6[1]-1] /100);
		if(n_A_PassSkill6[0] == 1 && n_A_PassSkill6[1] >= 1 && n_A_Weapon_zokusei == 1)
			wPDC = Math.floor(wPDC * baizok[n_A_PassSkill6[1]-1] /100);
		if(n_A_PassSkill6[0] == 2 && n_A_PassSkill6[1] >= 1 && n_A_Weapon_zokusei == 4)
			wPDC = Math.floor(wPDC * baizok[n_A_PassSkill6[1]-1] /100);
	}
	if(n_B_KYOUKA[1] && Taijin==0)
		wPDC = Math.floor(wPDC / 2);
	if(n_B_KYOUKA[1] && Taijin==1)
		wPDC = Math.floor(wPDC * 2 / 3);
	if(n_B_KYOUKA[7] && n_Enekyori != 2)
		wPDC -= Math.floor(wPDC * 20 * n_B_KYOUKA[7] / 100);
	if(n_B_KYOUKA[8] && n_Enekyori == 2)
		wPDC -= Math.floor(wPDC * 20 * n_B_KYOUKA[8] / 100);

	if(n_B[19] == 5)
		wPDC = 1;

	return wPDC;
}


function tPlusEnemyClick(){
if(Taijin){
	n_B = new Array();
	for(i=0;i<=26;i++)
		n_B[i] = MonsterOBJ[document.calcForm.B_Enemy.value][i];

	document.calcForm.B_LV.value = n_B[5];
	document.calcForm.B_AGI.value = n_B[8];
	document.calcForm.B_VIT.value = n_B[7];
	document.calcForm.B_INT.value = n_B[9];
	document.calcForm.B_LUK.value = n_B[11];
	document.calcForm.B_DEF.value = n_B[14];
	document.calcForm.B_MDEF.value = n_B[15];
}}



function tPlusTaiseiSyokia(){
if(Taijin){
	
	for (i=1;i<=150;i++){
		document.calcForm.B_AGI.options[i-1] = new Option(i,i);
		document.calcForm.B_VIT.options[i-1] = new Option(i,i);
		document.calcForm.B_INT.options[i-1] = new Option(i,i);
		document.calcForm.B_LUK.options[i-1] = new Option(i,i);
	}
	
	for (i=0;i<=100;i++){
		document.calcForm.B_DEF.options[i] = new Option(i,i);
		document.calcForm.B_MDEF.options[i] = new Option(i,i);
	}
	
	for (i=1;i<=99;i++)
		document.calcForm.B_LV.options[i-1] = new Option(i,i);
	
	
	for (i=0;i<=9;i++)
		document.calcForm.B_ZOKUSEI.options[i] = new Option(ZokuseiOBJ[i]+"1",i*10+1);
	
	
	for(i=0;i<=9;i++){
		document.calcForm.B_TAISEI2_1.options[i] = new Option(ZokuseiOBJ[i],i);
		document.calcForm.B_TAISEI3_1.options[i] = new Option(ZokuseiOBJ[i],i);
	}
	
	for(i=0;i<=10;i++)
		document.calcForm.B_TAISEI4.options[i] = new Option(i,i);
	
	for(i=0;i<=5;i++)
		document.calcForm.B_TAISEI5.options[i] = new Option(i,i);
	
	for(i=0;i<=10;i++)
		document.calcForm.B_TAISEI10.options[i] = new Option(i,i);

	n_B = new Array();
	for(i=0;i<=26;i++)
		n_B[i] = MonsterOBJ[document.calcForm.B_Enemy.value][i];

	i = eval(document.calcForm.B_Enemy.value);
	document.calcForm.B_LV.value = MonsterOBJ[i][5];
	document.calcForm.B_VIT.value = MonsterOBJ[i][7];
	document.calcForm.B_AGI.value = MonsterOBJ[i][8];
	document.calcForm.B_INT.value = MonsterOBJ[i][9];
	document.calcForm.B_LUK.value = MonsterOBJ[i][11];
	document.calcForm.B_DEF.value = MonsterOBJ[i][14];
	document.calcForm.B_MDEF.value = MonsterOBJ[i][15];
}}

function tPlusLucky(wPL){
if(Taijin){
	w = eval(document.calcForm.B_TAISEI6.value);
	w += (n_B[11] / 10);

	w = wPL * (100-w) / 100;
	return w;
}
else{
	return wPL;
}
}

function tPlusAG(){
if(Taijin){
	if(n_Enekyori!=2){
		wPAG = w_AG[eval(document.calcForm.B_TAISEI10.value)];
		w_DMG[0] *= (wPAG /100);
		w_DMG[1] *= (wPAG /100);
		w_DMG[2] *= (wPAG /100);
	}
}}
